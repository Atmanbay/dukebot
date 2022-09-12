import axios from "axios";
import { ButtonInteraction, Message } from "discord.js";
import { decode } from "html-entities";
import { shuffle } from "lodash-es";
import moment from "moment-timezone";
import { messageActions, triviaSessions } from "../../../database/database.js";
import { Button, MessageAction } from "../../../database/models.js";
import config from "../../../utils/config.js";
import {
  buildMessageActionRow,
  buildTable,
  generateId,
} from "../../../utils/general.js";
import { InteractionCreateHandler } from "../index.js";

type OpenTriviaDBQuestion = {
  category: string;
  type: "boolean" | "multiple";
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

type OpenTriviaDBResponse = {
  response_code: number;
  results: OpenTriviaDBQuestion[];
};

const handleAnswer = async ({
  answerIndex,
  interaction,
  messageAction,
}: {
  answerIndex: number;
  interaction: ButtonInteraction;
  messageAction: MessageAction;
}) => {
  let timestampCreated = interaction.createdTimestamp;
  if (messageAction.data.subcommand !== "question") {
    return;
  }

  const data = messageAction.data;
  const triviaSession = triviaSessions.get(
    (ts) => ts.id === data.triviaSessionId
  );

  let currentQuestion = triviaSession.questions[data.questionIndex];
  let existingAnswer = currentQuestion.responses.find(
    (r) => r.userId === interaction.member.user.id
  );

  let millisecondsRemaining = data.expireTimestamp - timestampCreated;
  if (millisecondsRemaining < 0) {
    await interaction.reply({
      content: `Time ran out before your selection was received.`,
      ephemeral: true,
    });
    return;
  } else if (millisecondsRemaining > triviaSession.millisecondsPerQuestion) {
    millisecondsRemaining = triviaSession.millisecondsPerQuestion;
  }

  let potentialScore = Math.ceil(
    config.trivia.maxPoints *
      (millisecondsRemaining / triviaSession.millisecondsPerQuestion)
  );

  let actualScore = 0;
  if (data.answerIndex === answerIndex) {
    actualScore = potentialScore;
  }

  if (existingAnswer) {
    if (existingAnswer.answerIndex === answerIndex) {
      await interaction.reply({
        content: `You already selected :regional_indicator_${String.fromCharCode(
          97 + answerIndex
        )}:`,
        ephemeral: true,
      });
      return;
    }

    existingAnswer.answerIndex = answerIndex;
    existingAnswer.score = actualScore;
  } else {
    currentQuestion.responses.push({
      userId: interaction.member.user.id,
      score: actualScore,
      answerIndex: answerIndex,
    });
  }

  await interaction.reply({
    content: `You selected :regional_indicator_${String.fromCharCode(
      97 + answerIndex
    )}: for ${potentialScore} potential points`,
    ephemeral: true,
  });
  await triviaSessions.update(triviaSession);
};

const TriviaInteractionCreateHandler: InteractionCreateHandler = {
  name: "trivia",
  description: "Play a game of trivia!",
  options: [
    {
      type: "SUB_COMMAND",
      name: "delete",
      description: "Deletes the current trivia session",
    },
    {
      type: "SUB_COMMAND",
      name: "create",
      description: "Creates a new trivia session!",
      options: [
        {
          type: "NUMBER",
          name: "amount",
          description: "How many questions to ask (defaults to 25)",
          required: false,
        },
        {
          type: "STRING",
          name: "category",
          description:
            "The category that the questions will come from (defaults to Any)",
          required: false,
          choices: [
            { name: "Any", value: "any" },
            { name: "General Knowledge", value: "9" },
            { name: "Entertainment: Books", value: "10" },
            { name: "Entertainment: Film", value: "11" },
            { name: "Entertainment: Music", value: "12" },
            { name: "Entertainment: Musicals & Theatres", value: "13" },
            { name: "Entertainment: Television", value: "14" },
            { name: "Entertainment: Video Games", value: "15" },
            { name: "Entertainment: Board Games", value: "16" },
            { name: "Science & Nature", value: "17" },
            { name: "Science: Computers", value: "18" },
            { name: "Science: Mathematics", value: "19" },
            { name: "Mythology", value: "20" },
            { name: "Sports", value: "21" },
            { name: "Geography", value: "22" },
            { name: "History", value: "23" },
            { name: "Politics", value: "24" },
            { name: "Art", value: "25" },
            { name: "Celebrities", value: "26" },
            { name: "Animals", value: "27" },
            { name: "Vehicles", value: "28" },
            { name: "Entertainment: Comics", value: "29" },
            { name: "Science: Gadgets", value: "30" },
            { name: "Entertainment: Japanese Anime & Manga", value: "31" },
            { name: "Entertainment: Cartoon & Animations", value: "32" },
          ],
        },
        {
          type: "STRING",
          name: "difficulty",
          description: "The difficulty of the questions (defaults to Any)",
          required: false,
          choices: [
            { name: "Any", value: "any" },
            { name: "Easy", value: "easy" },
            { name: "Medium", value: "medium" },
            { name: "Hard", value: "hard" },
          ],
        },
        {
          type: "STRING",
          name: "type",
          description: "The type of questions (defaults to Any)",
          required: false,
          choices: [
            { name: "Any", value: "any" },
            { name: "Multiple Choice", value: "multiple" },
            { name: "True / False", value: "boolean" },
          ],
        },
        {
          type: "NUMBER",
          name: "timer",
          description:
            "How long each question stays open for (defaults to 10 seconds)",
          required: false,
        },
      ],
    },
  ],
  handle: {
    delete: async (interaction) => {
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
    },
    create: async (interaction) => {
      if (triviaSessions.list().length > 0) {
        await interaction.reply({
          content:
            "A trivia session is currently in progress. Run `/trivia delete` to delete",
          ephemeral: true,
        });

        return;
      }

      const amount = interaction.options.getNumber("amount") ?? 25;
      const category = interaction.options.getString("category") ?? "any";
      const difficulty = interaction.options.getString("difficulty") ?? "any";
      const type = interaction.options.getString("type") ?? "any";
      const timer = interaction.options.getNumber("timer") ?? 10;

      let query = `amount=${amount}`;

      if (category && category !== "any") {
        query += `&category=${category}`;
      }

      if (difficulty && difficulty !== "any") {
        query += `&difficulty=${difficulty}`;
      }

      if (type && type !== "any") {
        query += `&type=${type}`;
      }

      const url = `https://opentdb.com/api.php?${query}`;
      const { data, status } = await axios.get<OpenTriviaDBResponse>(url, {
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
        questions: data.results.map((apiQuestion) => {
          return {
            id: generateId(),
            category: apiQuestion.category,
            type: apiQuestion.type,
            difficulty: apiQuestion.difficulty,
            question: decode(apiQuestion.question),
            correctAnswer: decode(apiQuestion.correct_answer),
            incorrectAnswers: apiQuestion.incorrect_answers.map((answer) =>
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
          style: "PRIMARY",
        },
      ];

      const messageActionRow = buildMessageActionRow(buttons);

      let reply = [
        "Trivia session created! Click `Start` to begin",
        "",
        "```",
        `${amount} questions`,
        `${category[0].toUpperCase() + category.substring(1)} category`,
        `${type[0].toUpperCase() + type.substring(1)} type`,
        `${difficulty[0].toUpperCase() + difficulty.substring(1)} difficulty`,
        "```",
      ];

      await interaction.reply({
        content: reply.join("\n"),
        components: [messageActionRow],
      });

      let message = await interaction.fetchReply();
      await messageActions.create({
        messageId: message.id,
        data: {
          command: "trivia",
          subcommand: "advance",
          triviaSessionId: triviaSession.id,
          questionIndex: 0,
        },
        buttons: buttons,
      });
    },
  },
  handleButton: {
    advance: async ({ interaction, messageAction }) => {
      if (messageAction.data.subcommand !== "advance") {
        return;
      }

      await (interaction.message as Message).edit({ components: [] });

      const data = messageAction.data;
      const session = triviaSessions.get(
        (ts) => ts.id === data.triviaSessionId
      );

      const question = session.questions[data.questionIndex];

      let choices: string[] = [];
      if (question.type === "boolean") {
        choices = ["True", "False"];
      } else {
        choices = shuffle([
          question.correctAnswer,
          ...question.incorrectAnswers,
        ]);
      }

      const choiceEmojis = ["🇦", "🇧", "🇨", "🇩"]; // regional indicator emojis

      const expireTime = moment
        .tz("America/New_York")
        .add(session.millisecondsPerQuestion, "ms");

      const reply = [
        `**Question #${data.questionIndex + 1}**`,
        ``,
        question.question,
        ``,
        `Closes <t:${expireTime.clone().add(500, "ms").unix()}:R>`, // adding some time to err on side of caution and account for network time etc
      ];

      let answerIndex: number;
      const buttons = choices.map((choice, index) => {
        if (choice === question.correctAnswer) {
          answerIndex = index;
        }
        let letter = String.fromCharCode(97 + index);
        return {
          type: letter,
          label: choice.substring(0, 80),
          buttonId: generateId(),
          emoji: choiceEmojis[index],
          style: "SECONDARY",
        } as Button;
      });

      const components = buttons.map((button) => {
        return buildMessageActionRow([button]);
      });

      await interaction.reply({
        content: reply.join("\n"),
        components: components,
      });

      let message = await interaction.fetchReply();
      await messageActions.create({
        messageId: message.id,
        data: {
          command: "trivia",
          subcommand: "question",
          triviaSessionId: session.id,
          questionIndex: data.questionIndex, // index of question in triviaSession.questions
          answerIndex: answerIndex, // index of choice that is the answer
          expireTimestamp: expireTime.valueOf(),
        },
        buttons: buttons,
      });

      setTimeout(async () => {
        const newComponents = buttons.map((button) => {
          button.disabled = true;
          if (button.label === question.correctAnswer) {
            button.style = "SUCCESS";
          }

          return buildMessageActionRow([button]);
        });
        await interaction.editReply({
          content: reply.slice(0, -1).join("\n"),
          components: newComponents,
        });

        await messageActions.delete(messageAction.id);

        let answeredQuestions = triviaSessions.get(
          (ts) => ts.id === data.triviaSessionId
        ).questions;

        let scoreByUser: Record<string, number> = answeredQuestions.reduce(
          (dict, question) => {
            question.responses.forEach((response) => {
              if (!(response.userId in dict)) {
                dict[response.userId] = 0;
              }

              dict[response.userId] += response.score;
            });

            return dict;
          },
          {}
        );

        let lastQuestionsResponses =
          answeredQuestions[data.questionIndex].responses;
        let longestNickname = 0;
        let rows: [string, string][] = await Promise.all(
          Object.entries(scoreByUser)
            .sort((a, b) => b[1] - a[1])
            .map(async ([userId, score]) => {
              let guildMember = await interaction.guild.members.fetch(userId);
              let nickname = guildMember.nickname;
              if (!nickname) {
                nickname = guildMember.user.username;
              }

              if (nickname.length > longestNickname) {
                longestNickname = nickname.length;
              }
              let scoreText = score.toString();
              let lastQuestionResponse = lastQuestionsResponses.find(
                (r) => r.userId === userId
              );
              if (lastQuestionResponse) {
                scoreText = `${scoreText} (${lastQuestionResponse.score})`;
              }

              return [nickname, scoreText];
            })
        );

        let table = buildTable({
          rows,
          leftColumnWidth: longestNickname + 3,
          rightColumnWidth: 6,
        });

        table.unshift("```");
        table.push("```");

        if (session.questions.length === data.questionIndex + 1) {
          await interaction.followUp({
            content: [`**Final Scores**`, ``, ...table].join("\n"),
          });

          await triviaSessions.delete(session.id);
          return;
        }

        let newButtons: Button[] = [
          {
            type: "advance",
            label: "Next Question",
            buttonId: generateId(),
            style: "PRIMARY",
          },
        ];

        let messageActionRow = buildMessageActionRow(newButtons);

        let newReply = [
          `**Scores after Question #${data.questionIndex + 1}**`,
          ``,
          ...table,
        ];

        let message = await interaction.followUp({
          content: newReply.join("\n"),
          components: [messageActionRow],
        });

        await messageActions.create({
          messageId: message.id,
          data: {
            command: "trivia",
            subcommand: "advance",
            triviaSessionId: session.id,
            questionIndex: data.questionIndex + 1, // index of question in triviaSession.questions
          },
          buttons: newButtons,
        });
      }, session.millisecondsPerQuestion);
    },
    a: (args) => handleAnswer({ ...args, answerIndex: 0 }),
    b: (args) => handleAnswer({ ...args, answerIndex: 1 }),
    c: (args) => handleAnswer({ ...args, answerIndex: 2 }),
    d: (args) => handleAnswer({ ...args, answerIndex: 3 }),
  },
};

export default TriviaInteractionCreateHandler;
