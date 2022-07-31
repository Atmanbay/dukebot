import { Command } from "../../../types/discord/command";
import { GuildMember, Role } from "discord.js";
import { blazes } from "../../../services/blaze";
import { buildTable } from "../../../utils";

const Blazes: Command = {
  name: "blazes",
  description: "Show the blazes table",
  type: "CHAT_INPUT",
  options: [
    {
      type: "MENTIONABLE",
      name: "user",
      description: "User or Role to get the blazes of (defaults to caller)",
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

    let total = 0;
    let guildMemberPromises = guildMembers.map(async (guildMember) => {
      let guildMemberBlazes = await blazes.list(
        (blaze) => blaze.userId === guildMember.id
      );

      total += guildMemberBlazes.length;
      return [guildMember.nickname, guildMemberBlazes.length] as [
        string,
        number
      ];
    });

    let guildMemberBlazes = await Promise.all(guildMemberPromises);

    guildMemberBlazes = guildMemberBlazes.sort((a, b) => {
      return a[1] - b[1];
    });

    if (guildMembers.length > 1) {
      guildMemberBlazes.push(["TOTAL", total]);
    }

    let table = buildTable({
      leftColumnWidth: 20,
      rightColumnWidth: 5,
      rows: guildMemberBlazes.map((value) => [value[0], value[1].toString()]),
    });
    table.unshift("```");
    table.push("```");

    await interaction.reply({ content: table.join("\n") });
  },
};

export default Blazes;
