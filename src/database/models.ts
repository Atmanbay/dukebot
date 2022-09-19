import {
  EmojiIdentifierResolvable,
  MessageButtonStyleResolvable,
} from "discord.js";
import { MessageActionData } from "./messageActionData";

export type Blaze = {
  id: string;
  created?: number;

  userId: string;
};

export type Job = {
  id: string;
  created?: number;

  userId: string;
  messageId?: string;
  granterUserId?: string;
  jobType: "good" | "bad";
};

export type Message = {
  id: string;
  created?: number;

  userId: string;
  content: string;
};

export type Button = {
  type: string;
  id?: string;
  buttonId: string;
  label?: string;
  emoji?: EmojiIdentifierResolvable;
  disabled?: boolean;
  style?: MessageButtonStyleResolvable;
};

export type MessageAction = {
  id: string;
  created?: number;

  interactionId?: string;
  messageId?: string; // We need this to handle ButtonInteractions that are tied to a reply of a ButtonInteraction
  data: MessageActionData;
  buttons: Button[];
};

export type Response = {
  id: string;
  created?: number;

  trigger: string;
  responses: { type: "string" | "emoji" | "customEmoji"; value: string }[];
  cooldown?: number;
  lastTriggered?: number;
};

export type Walkup = {
  id: string;
  created?: number;

  userId: string;
  clip: string;
};

export type BotConfig = {
  id: string;
  created?: number;

  key: string;
  value: string;
};

export type TriviaQuestionResponse = {
  userId: string;
  answerIndex: number;
  score: number;
};

export type TriviaQuestion = {
  id: string;
  created?: number;

  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  responses: TriviaQuestionResponse[];
};

export type TriviaSession = {
  id: string;
  created?: number;

  millisecondsPerQuestion: number;
  questions: TriviaQuestion[];
};

export type BaseDatabaseObject =
  | Blaze
  | Job
  | Message
  | Response
  | Walkup
  | MessageAction
  | BotConfig
  | TriviaSession;
