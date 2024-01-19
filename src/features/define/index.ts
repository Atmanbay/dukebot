import axios from "axios";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
} from "discord.js";
import { decode } from "html-entities";
import { sample } from "lodash-es";
import { HTMLElement, parse } from "node-html-parser";
import { Feature } from "..";

const handler = async (interaction: ChatInputCommandInteraction) => {
  const query = interaction.options.getString("query");
  const getRandom = interaction.options.getBoolean("random");

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

  let chosenDefinition: HTMLElement;
  if (getRandom) {
    chosenDefinition = sample(definitions);
  } else {
    chosenDefinition = definitions[0];
  }

  let definition = chosenDefinition.querySelector("div.meaning");
  let example = chosenDefinition.querySelector("div.example");

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

const define: Feature = {
  load: async (loaders) => {
    loaders.commands.load({
      type: ApplicationCommandType.ChatInput,
      name: "define",
      description: "Defines a given word using Urban Dictionary",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "query",
          description: "The word to define",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.Boolean,
          name: "random",
          description:
            "Set to true if you want a random defintion, false if you want the top definition (defaults to false)",
          required: false,
        },
      ],
    });

    loaders.chatInput.load({ commandTree: ["define"], handler });
  },
};

export default define;
