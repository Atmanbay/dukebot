import { Command } from "../../../types/discord/command.js";
import { GuildMember, Role } from "discord.js";
import { JobType } from "../../../types/database.js";
import { jobs } from "../../../services/job.js";
import { buildTable } from "../../../utils/index.js";

const Jobs: Command = {
  name: "jobs",
  description: "Show the jobs table",
  options: [
    {
      type: "MENTIONABLE",
      name: "user",
      description: "User or Role to get the jobs of (defaults to caller)",
      required: false,
    },
  ],
  run: async (interaction) => {
    const mentionable =
      interaction.options.getMentionable("user") ?? interaction.member;

    let guildMembers: GuildMember[] = [];
    if ((mentionable as Role).members) {
      guildMembers = Array.from((mentionable as Role).members.values());
    } else {
      guildMembers = [mentionable as GuildMember];
    }

    let guildMemberPromises = guildMembers.map(async (guildMember) => {
      let guildMemberJobs = await jobs.list(
        (job) => job.userId === guildMember.id
      );

      if (guildMemberJobs.length === 0) {
        return null;
      }

      let diff = guildMemberJobs.reduce((sum, job) => {
        switch (job.jobType) {
          case JobType.GOOD:
            return sum + 1;
          case JobType.BAD:
            return sum - 1;
          default:
            // TODO logging
            return sum;
        }
      }, 0);

      return [guildMember.nickname, diff] as [string, number];
    });

    let guildMemberJobs = await Promise.all(guildMemberPromises);
    guildMemberJobs = guildMemberJobs.sort((a, b) => {
      return a[1] - b[1];
    });

    if (guildMembers.length > 1) {
      let total = guildMemberJobs.reduce((sum, job) => {
        return sum + job[1];
      }, 0);
      guildMemberJobs.push(["TOTAL", total]);
    }

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

export default Jobs;
