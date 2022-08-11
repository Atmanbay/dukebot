import { acronymize } from "../../../services/acronym.js";
import { Command } from "../../../types/discord/command.js";
import { some } from "lodash-es";

const Acronym: Command = {
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
  run: async (interaction) => {
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

export default Acronym;
