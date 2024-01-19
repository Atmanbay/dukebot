import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
} from "discord.js";
import { filter, sample, some } from "lodash-es";
import { Feature } from "..";
import { getSingletonTable } from "../../database/database.js";
import { MessageContent } from "../../database/models.js";

const messageContents = await getSingletonTable<MessageContent>(
  "messageContents"
);

const handler = async (interaction: ChatInputCommandInteraction) => {
  let text = interaction.options.getString("text");

  let allMessages = messageContents.list();
  let wordObjects: { letter: string; word: string }[] = [];
  allMessages.forEach((m) => {
    m.content
      .split(" ")
      .filter((w) => w)
      .forEach((w) => {
        wordObjects.push({
          letter: w[0].toLowerCase(),
          word: w[0].toUpperCase() + w.substring(1),
        });
      });
  });

  let response = text.split("").map((letter) => {
    let matchingWords = filter(wordObjects, {
      letter: letter.toLowerCase(),
    });
    let result = sample(matchingWords);
    if (!result) {
      return null;
    }
    let trimmedWord = result.word.match(/\w+/)[0];
    return trimmedWord;
  });

  if (some(response, (r) => !r)) {
    await interaction.reply({
      content: "Acronym could not be built",
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({ content: ["```", ...response, "```"].join("\n") });
};

const acronym: Feature = {
  load: async (loaders) => {
    loaders.commands.load({
      type: ApplicationCommandType.ChatInput,
      name: "acronym",
      description:
        "Turns the given text into an acronym and tells you what each letter means",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "text",
          description: "The word/phrase to turn into an acronym",
          required: true,
        },
      ],
    });

    loaders.chatInput.load({ commandTree: ["acronym"], handler: handler });
  },
};

export default acronym;
