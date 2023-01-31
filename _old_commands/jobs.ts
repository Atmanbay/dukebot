import { GuildMember, Role } from "discord.js";
import { jobs } from "../../../database/database.js";
import { buildTable } from "../../../utils/general.js";
import { logInfo } from "../../../utils/logger.js";
import { InteractionCreateHandler } from "../index.js";

const JobsInteractionCreateHandler: InteractionCreateHandler = {
  name: "jobs",
  description: "Show the jobs table",
  options: [
    {
      type: "MENTIONABLE",
      name: "target",
      description: "User or Role to get the jobs of (defaults to caller)",
      required: false,
    },
  ],
  handle: async (interaction) => {
    const mentionable =
      interaction.options.getMentionable("target") ?? interaction.member;

    let guildMembers: GuildMember[] = [];
    if ((mentionable as Role).members) {
      guildMembers = Array.from((mentionable as Role).members.values());
    } else {
      guildMembers = [mentionable as GuildMember];
    }

    let guildMemberPromises = guildMembers.map(async (guildMember) => {
      let guildMemberJobs = jobs.list((job) => job.userId === guildMember.id);

      if (guildMemberJobs.length === 0) {
        return null;
      }

      let diff = guildMemberJobs.reduce((sum, job) => {
        switch (job.jobType) {
          case "good":
            return sum + 1;
          case "bad":
            return sum - 1;
          default:
            logInfo(`No logic to handle jobs of type ${job.jobType}`);
            return sum;
        }
      }, 0);

      return [guildMember.nickname, diff] as [string, number];
    });

    let guildMemberJobs = await Promise.all(guildMemberPromises);
    guildMemberJobs = guildMemberJobs
      .filter((gmj) => gmj)
      .sort((a, b) => {
        return b[1] - a[1];
      });

    let table = buildTable({
      leftColumnWidth: 20,
      rightColumnWidth: 5,
      rows: guildMemberJobs.map((value) => [value[0], value[1].toString()]),
    });
    table.unshift("```");
    table.push("```");

    await interaction.reply({ content: table.join("\n") });
  },
};

export default JobsInteractionCreateHandler;
