import { ButtonInteraction } from "discord.js";
import { TriviaQuestionMessageActionData } from "../../../../../database/messageActionData";
import { MessageAction } from "../../../../../database/models";
import { handleAnswer } from "../index.js";

export const handler = (
  interaction: ButtonInteraction,
  messageAction: MessageAction<TriviaQuestionMessageActionData>
) => handleAnswer({ interaction, messageAction, answerIndex: 1 });
