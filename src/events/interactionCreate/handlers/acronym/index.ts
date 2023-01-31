import {
  ApplicationCommandOptionType,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
} from "discord.js";
import { filter, sample, some } from "lodash-es";
import { messages } from "../../../../database/database.js";

export const data: ChatInputApplicationCommandData = {
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
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  let text = interaction.options.getString("text");

  let allMessages = messages.list();
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
    return interaction.reply({
      content: "Acronym could not be built",
      ephemeral: true,
    });
  }

  response.unshift("```");
  response.push("```");

  return interaction.reply({ content: response.join("\n") });
};
