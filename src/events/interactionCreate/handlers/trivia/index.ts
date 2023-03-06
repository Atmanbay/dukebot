import { ButtonInteraction, ChatInputApplicationCommandData } from "discord.js";
import { triviaSessions } from "../../../../database/database.js";
import { TriviaQuestionMessageAction } from "../../../../database/models.js";
import config from "../../../../utils/config.js";

export const data: ChatInputApplicationCommandData = {
  name: "trivia",
  description: "Play a game of trivia",
};

export const handleAnswer = async ({
  answerIndex,
  interaction,
  messageAction,
}: {
  answerIndex: number;
  interaction: ButtonInteraction;
  messageAction: TriviaQuestionMessageAction;
}) => {
  let timestampCreated = interaction.createdTimestamp;

  const triviaSession = triviaSessions.get(
    (ts) => ts.id === messageAction.data.triviaSessionId
  );

  let currentQuestion =
    triviaSession.questions[messageAction.data.questionIndex];
  let existingAnswer = currentQuestion.responses.find(
    (r) => r.userId === interaction.member.user.id
  );

  let millisecondsRemaining =
    messageAction.data.expireTimestamp - timestampCreated;
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
  if (messageAction.data.answerIndex === answerIndex) {
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
