import { GuildMember, Role } from "discord.js";
import { messages } from "../../../services/database.js";
import { buildMarkov } from "../../../services/markov.js";
import { Command } from "../index.js";

const Markov: Command = {
  name: "markov",
  description: "Generate a markov for the specified user/role",
  options: [
    {
      type: "MENTIONABLE",
      name: "target",
      description:
        "The user/role to use as the basis for the markov (defaults to caller)",
    },
  ],
  run: async (interaction) => {
    let target = interaction.options.getMentionable("target");
    let guildMembers: GuildMember[] = [];
    if (!target) {
      guildMembers = [interaction.member as GuildMember];
    } else if ((target as Role).members) {
      guildMembers = Array.from((target as Role).members.values());
    } else {
      guildMembers = [target as GuildMember];
    }

    let promises = guildMembers.map(async (guildMember) => {
      return messages.list((m) => m.userId === guildMember.user.id);
    });

    let allMessages = await Promise.all(promises).then((arrays) =>
      arrays.flat().map((m) => m.content)
    );

    try {
      let markov = buildMarkov({
        messages: allMessages,
        stateSize: 2,
        maxTries: 200,
        variance: 1,
      });

      return interaction.reply(markov);
    } catch (error) {
      return interaction.reply({
        content: "Unable to build markov",
        ephemeral: true,
      });
    }
  },
};

export default Markov;
