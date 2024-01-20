import axios from "axios";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import { decode } from "html-entities";
import { shuffle } from "lodash-es";
import moment from "moment-timezone";
import { Feature } from "..";
import { getSingletonTable } from "../../database/database.js";
import { BaseDatabaseObject } from "../../database/models.js";

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

type TheTriviaAPIQuestion = {
  id: string;
  question: {
    text: string;
  };
  correctAnswer: string;
  incorrectAnswers: string[];
};

type TheTriviaAPIResponse = TheTriviaAPIQuestion[];

type TriviaQuestionResponse = {
  userId: string;
  isCorrect: boolean;
};

type TriviaQuestion = {
  text: string;
  choices: string[];
  correctChoiceIndex: number;
  responses: TriviaQuestionResponse[];
};

type TriviaSession = BaseDatabaseObject & {
  millisecondsPerQuestion: number;
  questions: TriviaQuestion[];
  currentQuestionIndex: number;
};

const triviaSessions = await getSingletonTable<TriviaSession>("triviaSessions");

const createHandler = async (interaction: ChatInputCommandInteraction) => {
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
    query += `&difficulties=${difficulty}`;
  }

  const url = `https://the-trivia-api.com/v2/questions?${query}`;
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

  await triviaSessions.create({
    questions: data.map((apiQuestion) => {
      let choices = shuffle([
        apiQuestion.correctAnswer,
        ...apiQuestion.incorrectAnswers,
      ]);

      let correctChoiceIndex = choices.indexOf(apiQuestion.correctAnswer);

      return {
        text: decode(apiQuestion.question.text),
        choices: choices,
        correctChoiceIndex: correctChoiceIndex,
        responses: [],
      };
    }),
    millisecondsPerQuestion: timer * 1000,
    currentQuestionIndex: 0,
  });

  const button = new ButtonBuilder()
    .setCustomId("advance")
    .setLabel("Start")
    .setStyle(ButtonStyle.Primary);

  const actionRowBuilder = new ActionRowBuilder<ButtonBuilder>().addComponents(
    button
  );

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
    components: [actionRowBuilder],
  });
};

const deleteHandler = async (interaction: ChatInputCommandInteraction) => {
  if (triviaSessions.list().length > 0) {
    let triviaSession = triviaSessions.list()[0];
    await triviaSessions.delete(triviaSession.id);

    await interaction.reply({
      content: "Trivia session deleted",
      ephemeral: true,
    });
  } else {
    await interaction.reply({
      content: "No trivia session found",
      ephemeral: true,
    });
  }
};

const closeQuestion = async ({
  interaction,
  triviaSession,
  reply,
  buttons,
}: {
  interaction: ButtonInteraction;
  triviaSession: TriviaSession;
  reply: string[];
  buttons: ButtonBuilder[];
}) => {
  const currentQuestion =
    triviaSession.questions[triviaSession.currentQuestionIndex];

  const closedButtons = buttons.map((button, index) => {
    if (index === currentQuestion.correctChoiceIndex) {
      button.setStyle(ButtonStyle.Success);
    }

    button.setDisabled(true);
    return button;
  });

  await interaction.editReply({
    content: reply.slice(0, -1).join("\n"),
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(closedButtons),
    ],
  });

  let longestUsernameLength = 0;
  let scores: { [name: string]: number } = {};
  for (let i = 0; i <= triviaSession.currentQuestionIndex; i++) {
    let responses = triviaSession.questions[i].responses;
    await Promise.all(
      responses.map(async (r) => {
        if (!r.isCorrect) {
          return;
        }

        let guildMember = await interaction.guild.members.fetch(r.userId);
        let name = guildMember.nickname ?? guildMember.user.username ?? "Anon";

        if (!(name in scores)) {
          scores[name] = 0;
        }

        scores[name] = scores[name] + (i + 1) * 10;

        if (name.length > longestUsernameLength) {
          longestUsernameLength = name.length;
        }
      })
    );
  }

  let correctAnswerText = `**Correct answer**\n\`\`\`(${String.fromCharCode(
    65 + currentQuestion.correctChoiceIndex
  ).toUpperCase()}) ${
    currentQuestion.choices[currentQuestion.correctChoiceIndex]
  }\`\`\``;

  let sortableArray = Object.entries(scores);
  let sortedArray = sortableArray.sort(([, a], [, b]) => b - a);
  let scoreText = sortedArray.map(([name, score], index) => {
    return `${index + 1}) ${name}${" ".repeat(
      longestUsernameLength - name.length + 1
    )}${score}`;
  });

  if (
    triviaSession.currentQuestionIndex + 1 >=
    triviaSession.questions.length
  ) {
    await interaction.followUp({
      content: [
        correctAnswerText,
        "",
        "**FINAL**",
        "```",
        ...scoreText,
        "```",
      ].join("\n"),
    });

    await triviaSessions.delete(triviaSession.id);
    return;
  } else {
    let button = new ButtonBuilder()
      .setCustomId("advance")
      .setLabel("Next Question")
      .setStyle(ButtonStyle.Primary);

    await interaction.followUp({
      content: [
        correctAnswerText,
        "",
        "**Scores**",
        "```",
        ...scoreText,
        "```",
      ].join("\n"),
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)],
    });

    triviaSession.currentQuestionIndex += 1;
    await triviaSessions.update(triviaSession);
  }
};

const choiceEmojis = ["🇦", "🇧", "🇨", "🇩"];
const advanceHandler = async (interaction: ButtonInteraction) => {
  const triviaSession = triviaSessions.list()[0];
  const msPerQuestion = triviaSession.millisecondsPerQuestion + 250; // adding some time to err on side of caution and account for network time etc

  const currentQuestion =
    triviaSession.questions[triviaSession.currentQuestionIndex];

  const buttons = currentQuestion.choices.map((c, index) => {
    let letter = String.fromCharCode(65 + index); // index -> ASCII code -> capital letter
    return new ButtonBuilder()
      .setCustomId(`choice${letter}`)
      .setLabel(c.substring(0, 80))
      .setEmoji(choiceEmojis[index])
      .setStyle(ButtonStyle.Secondary);
  });

  const firstRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    buttons.slice(0, 2)
  );
  const secondRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    buttons.slice(2, 4)
  );

  const expireTime = moment.tz("America/New_York").add(msPerQuestion, "ms");
  const unixTime = expireTime.clone().add(1, "second").unix();

  const reply = [
    `**Question #${triviaSession.currentQuestionIndex + 1}**  *${
      (triviaSession.currentQuestionIndex + 1) * 10
    } points*`,
    ``,
    currentQuestion.text,
    ``,
    `Closes <t:${unixTime}:R>`,
  ];

  await interaction.reply({
    content: reply.join("\n"),
    components: [firstRow, secondRow],
  });

  setTimeout(
    () =>
      closeQuestion({
        interaction,
        triviaSession,
        reply,
        buttons,
      }),
    msPerQuestion
  );
};

const choiceHandler = async (
  interaction: ButtonInteraction,
  choiceIndex: number
) => {
  const guildMember = interaction.member as GuildMember;
  const triviaSession = triviaSessions.list()[0];
  const currentQuestion =
    triviaSession.questions[triviaSession.currentQuestionIndex];

  let response = currentQuestion.responses.find(
    (r) => r.userId === guildMember.user.id
  );

  const isCorrect = currentQuestion.correctChoiceIndex === choiceIndex;

  if (response) {
    response.isCorrect = isCorrect;
    triviaSessions.update(triviaSession);
  } else {
    currentQuestion.responses.push({
      userId: guildMember.user.id,
      isCorrect: isCorrect,
    });
  }

  await triviaSessions.update(triviaSession);
  await interaction.reply({
    content: `You selected ${choiceEmojis[choiceIndex]} ${currentQuestion.choices[choiceIndex]}`,
    ephemeral: true,
  });
};

const emoji: Feature = {
  load: async (loaders) => {
    loaders.commands.load({
      type: ApplicationCommandType.ChatInput,
      name: "trivia",
      description: "Play a game of trivia",
      options: [
        {
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
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "delete",
          description: "Deletes the current trivia session",
        },
      ],
    });

    loaders.chatInput.load({
      commandTree: ["trivia", "create"],
      handler: createHandler,
    });
    loaders.chatInput.load({
      commandTree: ["trivia", "delete"],
      handler: deleteHandler,
    });

    loaders.buttons.load({ id: "advance", handler: advanceHandler });
    loaders.buttons.load({
      id: "choiceA",
      handler: (interaction) => choiceHandler(interaction, 0),
    });
    loaders.buttons.load({
      id: "choiceB",
      handler: (interaction) => choiceHandler(interaction, 1),
    });
    loaders.buttons.load({
      id: "choiceC",
      handler: (interaction) => choiceHandler(interaction, 2),
    });
    loaders.buttons.load({
      id: "choiceD",
      handler: (interaction) => choiceHandler(interaction, 3),
    });
  },
};

export default emoji;
