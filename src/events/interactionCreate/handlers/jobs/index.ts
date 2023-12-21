import { jobs } from "@/helpers/database/index.js";
import { buildTable } from "@/helpers/general.js";
import { logInfo } from "@/helpers/logger.js";
import {
  ApplicationCommandOptionType,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  GuildMember,
  Role,
} from "discord.js";

export const data: ChatInputApplicationCommandData = {
  name: "jobs",
  description: "Show the jobs table",
  options: [
    {
      type: ApplicationCommandOptionType.Mentionable,
      name: "target",
      description:
        "The user/role to look up the jobs of (defaults to @everyone)",
      required: false,
    },
  ],
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  const mentionable =
    interaction.options.getMentionable("target") ??
    interaction.guild.roles.everyone;

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
};
