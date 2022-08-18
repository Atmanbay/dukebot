/// <reference path="../../../types/decode-html.d.ts" />
import decode from "decode-html";
import { sample } from "lodash-es";
import { parse } from "node-html-parser";
import request from "request-promise-native";
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

    let escapedWord = encodeURI(query);
    let url = `https://www.urbandictionary.com/define.php?term=${escapedWord}`;

    let htmlString = await request(url);
    let root = parse(htmlString);

    let definitions = root.querySelectorAll(".definition");
    if (definitions.length === 0) {
      return null;
    }

    let randomDefinition = sample(definitions);

    let definition = randomDefinition.querySelector("div.meaning");
    let example = randomDefinition.querySelector("div.example");

    let response = [
      `**${query}**`,
      "",
      decode(definition.structuredText),
      "",
      `_${decode(example.structuredText)}_`,
    ];

    await interaction.reply({
      content: response.join("\n"),
    });
  },
};

export default Define;
