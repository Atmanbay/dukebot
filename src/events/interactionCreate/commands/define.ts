import { define } from "../../../services/define.js";
import { Command } from "../index.js";

const Define: Command = {
  name: "define",
  description: "Defines a given word using Urban Dictionary",
  options: [
    {
      type: "STRING",
      name: "query",
      description: "The word to define",
      required: true,
    },
  ],
  run: async (interaction) => {
    const query = interaction.options.getString("query");
    const definition = await define(query);

    let response = [
      `**${query}**`,
      "",
      definition.definition,
      "",
      `_${definition.example}_`,
    ];

    await interaction.reply({
      content: response.join("\n"),
    });
  },
};

export default Define;
