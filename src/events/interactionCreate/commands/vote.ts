import { Message } from "discord.js";
import ne from "node-emoji";
import { Command } from "../index.js";
const find = ne.find;

const EMOJIS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

const getEmojiByName = (emojiName: string) => {
  return find(emojiName);
};

const Vote: Command = {
  name: "vote",
  description: "Returns a greeting",
  options: [
    {
      type: "STRING",
      name: "description",
      description: "Description of what the vote is about",
      required: true,
    },
    {
      type: "STRING",
      name: "choices",
      description: "Choices that voters can choose, separated by |",
      required: true,
    },
  ],
  run: async (interaction) => {
    let description = interaction.options.getString("description");
    let choices = interaction.options.getString("choices").split("|");

    if (choices.length > EMOJIS.length) {
      interaction.reply({
        content: "Too many choices were provided",
        ephemeral: true,
      });
      return;
    }

    let content = [];
    content.push(`**${description}**`);
    content.push("");
    choices.forEach((choice, index) =>
      content.push(`:${EMOJIS[index]}:  ${choice}`)
    );

    await interaction.reply(content.join("\n"));
    let message = (await interaction.fetchReply()) as Message;
    EMOJIS.slice(0, choices.length).forEach((emojiName) => {
      let emoji = getEmojiByName(emojiName);
      message.react(emoji.emoji);
    });
  },
};

export default Vote;
