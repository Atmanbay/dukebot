import axios from "axios";
import decode from "decode-html";
import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ButtonStyle,
  ChatInputCommandInteraction,
} from "discord.js";
import {
  messageActions,
  triviaSessions,
} from "../../../../../../database/database.js";
import { Button } from "../../../../../../database/models.js";
import {
  buildMessageActionRow,
  generateId,
} from "../../../../../../utils/general.js";

const CATEGORIES = [
  { name: "Any", value: "any" },
  { name: "Arts & Literature", value: "arts_and_literature" },
  { name: "Film & TV", value: "film_and_tv" },
  { name: "Food & Drink", value: "food_and_drink" },
  { name: "General Knowledge", value: "general_knowledge" },
  { name: "Geography", value: "geography" },
  { name: "History", value: "history" },
  { name: "Music", value: "music" },
  { name: "Science", value: "science" },
  { name: "Society & Culture", value: "society_and_culture" },
  { name: "Sport & Leisure", value: "sport_and_leisure" },
];

const DIFFICULTIES = [
  { name: "Any", value: "any" },
  { name: "Easy", value: "easy" },
  { name: "Medium", value: "medium" },
  { name: "Hard", value: "hard" },
];

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "create",
  description: "Creates a new trivia session",
  options: [
    {
      type: ApplicationCommandOptionType.Number,
      name: "limit",
      description: "How many questions to ask (defaults to 10)",
      minValue: 1,
      required: false,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "category",
      description:
        "The category that the questions will come from (defaults to Any)",
      required: false,
      choices: CATEGORIES,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "difficulty",
      description: "The difficulty of the questions (defaults to Any)",
      required: false,
      choices: DIFFICULTIES,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "timer",
      description:
        "How long each question stays open for (defaults to 15 seconds)",
      required: false,
    },
  ],
};

type TheTriviaAPIQuestion = {
  id: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
};

type TheTriviaAPIResponse = TheTriviaAPIQuestion[];

export const handler = async (interaction: ChatInputCommandInteraction) => {
  if (triviaSessions.list().length > 0) {
    await interaction.reply({
      content:
        "A trivia session is currently in progress. Run `/trivia delete` to delete",
      ephemeral: true,
    });

    return;
  }

  const limit = interaction.options.getNumber("limit") ?? 10;
  const category = interaction.options.getString("category") ?? "any";
  const difficulty = interaction.options.getString("difficulty") ?? "any";
  const timer = interaction.options.getNumber("timer") ?? 15;

  let query = `limit=${limit}&region=US`;

  if (category && category !== "any") {
    query += `&categories=${category}`;
  }

  if (difficulty && difficulty !== "any") {
    query += `&difficulty=${difficulty}`;
  }

  const url = `https://the-trivia-api.com/api/questions?${query}`;
  const { data, status } = await axios.get<TheTriviaAPIResponse>(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (status !== 200) {
    await interaction.reply({
      content:
        "An HTTP error occurred when trying to fetch the questions. Please try again later.",
      ephemeral: true,
    });
    return;
  }

  const triviaSession = await triviaSessions.create({
    questions: data.map((apiQuestion) => {
      return {
        id: apiQuestion.id,
        question: decode(apiQuestion.question),
        correctAnswer: decode(apiQuestion.correctAnswer),
        incorrectAnswers: apiQuestion.incorrectAnswers.map((answer) =>
          decode(answer)
        ),
        responses: [],
      };
    }),
    millisecondsPerQuestion: timer * 1000,
  });

  const buttons: Button[] = [
    {
      type: "advance",
      label: "Start",
      buttonId: generateId(),
      style: ButtonStyle.Primary,
    },
  ];

  const messageActionRow = buildMessageActionRow(buttons);

  let reply = [
    "Trivia session created! Click `Start` to begin",
    "",
    "```",
    `${data.length} questions`,
    `${timer} seconds per question`,
    `${CATEGORIES.find((c) => c.value === category).name} category`,
    `${DIFFICULTIES.find((c) => c.value === difficulty).name} difficulty`,
    "```",
  ];

  await interaction.reply({
    content: reply.join("\n"),
    components: [messageActionRow],
  });

  await messageActions.create({
    interactionId: interaction.id,
    command: "trivia",
    subcommand: "advance",
    data: {
      triviaSessionId: triviaSession.id,
      questionIndex: 0,
    },
    buttons: buttons,
  });
};
