import { acronymize } from "../../../services/acronym";
import { Command } from "../../../types/discord/command";

const Acronym: Command = {
  name: "acronym",
  description:
    "Turns the given text into an acronym and tells you what each letter means",
  options: [
    {
      type: "STRING",
      name: "acronym",
      description: "The word/phrase to turn into an acronym",
      required: true,
    },
  ],
  run: async (interaction) => {
    let text = interaction.options.getString("text");
    let acronymizedText = await acronymize(text);

    acronymizedText.unshift("```");
    acronymizedText.push("```");

    interaction.reply({ content: acronymizedText.join("\n") });
  },
};

export default Acronym;
