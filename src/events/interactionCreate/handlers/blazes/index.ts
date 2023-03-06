import {
  ApplicationCommandOptionType,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  GuildMember,
  Role,
} from "discord.js";
import { blazes } from "../../../../database/database.js";
import { buildTable } from "../../../../utils/general.js";

export const data: ChatInputApplicationCommandData = {
  name: "blazes",
  description: "Create and manage lines and bets",
  options: [
    {
      type: ApplicationCommandOptionType.Mentionable,
      name: "target",
      description:
        "The user/role to look up the blazes of (defaults to @everyone)",
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
    let guildMemberBlazes = blazes.list(
      (blaze) => blaze.userId === guildMember.id
    );

    if (guildMemberBlazes.length === 0) {
      return null;
    }

    return [guildMember.nickname, guildMemberBlazes.length] as const;
  });

  let guildMemberBlazes = await Promise.all(guildMemberPromises);
  guildMemberBlazes = guildMemberBlazes
    .filter((gmj) => gmj)
    .sort((a, b) => {
      return b[1] - a[1];
    });

  let table = buildTable({
    leftColumnWidth: 20,
    rightColumnWidth: 5,
    rows: guildMemberBlazes.map((value) => [value[0], value[1].toString()]),
  });

  table.unshift("```");
  table.push("```");

  await interaction.reply({ content: table.join("\n") });
};
