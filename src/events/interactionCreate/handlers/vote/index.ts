import {
  ApplicationCommandOptionType,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
} from "discord.js";
import ne from "node-emoji";
const find = ne.find;

export const data: ChatInputApplicationCommandData = {
  name: "vote",
  description: "Create a vote",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "description",
      description: "Description of what the vote is about",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "choices",
      description: "Choices that voters can choose, separated by |",
      required: true,
    },
  ],
};

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
  "dog",
  "cat",
  "bear",
  "rabbit",
  "eagle",
  "lobster",
  "star",
  "fire",
  "apple",
  "banana",
];

const getEmojiByName = (emojiName: string) => {
  return find(emojiName);
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
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
  let message = await interaction.fetchReply();
  EMOJIS.slice(0, choices.length).forEach((emojiName) => {
    let emoji = getEmojiByName(emojiName);
    message.react(emoji.emoji);
  });
};
