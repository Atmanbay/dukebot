import axios from "axios";
import decode from "decode-html";
import {
  ApplicationCommandOptionType,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
} from "discord.js";
import { sample } from "lodash-es";
import { parse } from "node-html-parser";

export const data: ChatInputApplicationCommandData = {
  name: "define",
  description: "Defines a given word using Urban Dictionary",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "query",
      description: "The word to define",
      required: true,
    },
  ],
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  const query = interaction.options.getString("query");

  let escapedWord = encodeURI(query);
  let url = `https://www.urbandictionary.com/define.php?term=${escapedWord}`;

  const response = await axios(url);
  if (response.status !== 200) {
    await interaction.reply({
      content:
        "An HTTP error occurred when trying to fetch your definition. . Please try again later.",
      ephemeral: true,
    });
    return;
  }
  let root = parse(response.data);

  let definitions = root.querySelectorAll(".definition");
  if (definitions.length === 0) {
    return null;
  }

  let randomDefinition = sample(definitions);

  let definition = randomDefinition.querySelector("div.meaning");
  let example = randomDefinition.querySelector("div.example");

  let message = [
    `**${query}**`,
    "",
    decode(definition.structuredText),
    "",
    `_${decode(example.structuredText)}_`,
  ];

  await interaction.reply({
    content: message.join("\n"),
  });
};
