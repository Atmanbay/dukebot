import { TriviaQuestionMessageAction } from "@/helpers/database/models.js";
import { ButtonInteraction } from "discord.js";
import { handleAnswer } from "../index.js";

export const handler = (
  interaction: ButtonInteraction,
  messageAction: TriviaQuestionMessageAction
) => handleAnswer({ interaction, messageAction, answerIndex: 0 });
