import { GuildMember, Role } from "discord.js";
import Markov, { MarkovGenerateOptions } from "markov-strings";
import { messages } from "../../../database/database.js";
import { logError } from "../../../utils/logger.js";
import { InteractionCreateHandler } from "../index.js";

export const buildMarkov = ({
  messages,
  stateSize,
  maxTries,
  variance,
}: {
  messages: string[];
  stateSize: number;
  maxTries: number;
  variance: number;
}) => {
  // TODO: Why do I have to do this
  let markov = new Markov["default"]({ stateSize });
  markov.addData(messages);

  let result = markov.generate({
    maxTries: maxTries,
    prng: Math.random,
    filter: (result) => {
      return (
        result.refs.length > variance &&
        result.score > 1 &&
        result.string.length <= 2000
      );
    },
  } as MarkovGenerateOptions);

  return result.string as string;
};

const MarkovInteractionCreateHandler: InteractionCreateHandler = {
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
  handle: async (interaction) => {
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

      await interaction.reply(markov);
    } catch (error) {
      logError(error);
      await interaction.reply({
        content: "Unable to build markov",
        ephemeral: true,
      });
    }
  },
};

export default MarkovInteractionCreateHandler;
