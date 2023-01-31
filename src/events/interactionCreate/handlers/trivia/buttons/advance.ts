import { ButtonInteraction, ButtonStyle, Message } from "discord.js";
import { shuffle } from "lodash-es";
import moment from "moment-timezone";
import {
  messageActions,
  triviaSessions,
} from "../../../../../database/database";
import { TriviaAdvanceMessageActionData } from "../../../../../database/messageActionData";
import { Button, MessageAction } from "../../../../../database/models";
import {
  buildMessageActionRow,
  buildTable,
  generateId,
} from "../../../../../utils/general";

export const handler = async (
  interaction: ButtonInteraction,
  messageAction: MessageAction<TriviaAdvanceMessageActionData>
) => {
  await (interaction.message as Message).edit({ components: [] });

  const data = messageAction.data;
  const session = triviaSessions.get((ts) => ts.id === data.triviaSessionId);

  const question = session.questions[data.questionIndex];

  let choices = shuffle([question.correctAnswer, ...question.incorrectAnswers]);

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
      style: ButtonStyle.Secondary,
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
        button.style = ButtonStyle.Success;
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

    let correctAnswerMessage = `**Correct answer**\n\`\`\`(${String.fromCharCode(
      97 + answerIndex
    ).toUpperCase()}) ${question.correctAnswer}\`\`\``;

    let table = buildTable({
      rows,
      leftColumnWidth: longestNickname + 3,
      rightColumnWidth: 6,
    });

    table.unshift("```");
    table.push("```");

    if (session.questions.length === data.questionIndex + 1) {
      await interaction.followUp({
        content: [correctAnswerMessage, ``, `**Final Scores**`, ...table].join(
          "\n"
        ),
      });

      await triviaSessions.delete(session.id);
      return;
    }

    let newButtons: Button[] = [
      {
        type: "advance",
        label: "Next Question",
        buttonId: generateId(),
        style: ButtonStyle.Primary,
      },
    ];

    let messageActionRow = buildMessageActionRow(newButtons);

    let newReply = [
      correctAnswerMessage,
      "",
      `**Scores after Question #${data.questionIndex + 1}**`,
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
};
