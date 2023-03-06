import { ButtonInteraction } from "discord.js";
import { TriviaQuestionMessageAction } from "../../../../../database/models.js";
import { handleAnswer } from "../index.js";

export const handler = (
  interaction: ButtonInteraction,
  messageAction: TriviaQuestionMessageAction
) => handleAnswer({ interaction, messageAction, answerIndex: 0 });
