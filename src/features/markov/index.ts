import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  GuildMember,
  Role,
} from "discord.js";
import Markov, { MarkovGenerateOptions } from "markov-strings";
import { Feature } from "..";
import { getSingletonTable } from "../../database/database.js";
import { MessageContent } from "../../database/models.js";
import { logError } from "../../utils/logger.js";

const messageContents = await getSingletonTable<MessageContent>(
  "messageContents"
);

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

const handler = async (interaction: ChatInputCommandInteraction) => {
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
    return messageContents.list((m) => m.userId === guildMember.user.id);
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
};

const emoji: Feature = {
  load: async (loaders) => {
    loaders.commands.load({
      type: ApplicationCommandType.ChatInput,
      name: "markov",
      description: "Generate a markov for the specified user/role",
      options: [
        {
          type: ApplicationCommandOptionType.Mentionable,
          name: "target",
          description:
            "The user/role to use as the basis for the markov (defaults to caller)",
          required: false,
        },
      ],
    });

    loaders.chatInput.load({ commandTree: ["markov"], handler });
  },
};

export default emoji;
