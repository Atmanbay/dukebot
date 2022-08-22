import { filter, sample, some } from "lodash-es";
import { messages } from "../../../database/database.js";
import { InteractionCreateHandler } from "../index.js";

export const acronymize = async (word: string): Promise<string[]> => {
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

  let response = word.split("").map((letter) => {
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

  return response;
};

const AcronymInteractionCreateHandler: InteractionCreateHandler = {
  name: "acronym",
  description:
    "Turns the given text into an acronym and tells you what each letter means",
  options: [
    {
      type: "STRING",
      name: "text",
      description: "The word/phrase to turn into an acronym",
      required: true,
    },
  ],
  handle: async (interaction) => {
    let text = interaction.options.getString("text");
    let acronymizedText = await acronymize(text);

    if (some(acronymizedText, (r) => !r)) {
      return interaction.reply({
        content: "Acronym could not be built",
        ephemeral: true,
      });
    }

    acronymizedText.unshift("```");
    acronymizedText.push("```");

    return interaction.reply({ content: acronymizedText.join("\n") });
  },
};

export default AcronymInteractionCreateHandler;
