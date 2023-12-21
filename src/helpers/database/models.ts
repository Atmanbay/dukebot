import { ButtonStyle, EmojiIdentifierResolvable } from "discord.js";

export type Button = {
  type: string;
  id?: string;
  buttonId: string;
  label?: string;
  emoji?: EmojiIdentifierResolvable;
  disabled?: boolean;
  style?: ButtonStyle;
};

type BaseMessageAction = {
  id: string;
  created?: number;

  interactionId?: string;
  messageId?: string; // We need this to handle ButtonInteractions that are tied to a reply to a ButtonInteraction
  buttons: Button[];
};

export type EmojiKitchenMessageAction = BaseMessageAction & {
  command: "emoji";
  subcommand: "combine";

  data: {
    path: string;
    emojiName: string;
  };
};

export type AudioUploadMessageAction = BaseMessageAction & {
  command: "audio";
  subcommand: "upload";

  data: {
    clipName: string;
  };
};

export type AudioListMessageAction = BaseMessageAction & {
  command: "audio";
  subcommand: "list";

  data: {
    currentPage: number;
  };
};

export type TriviaAdvanceMessageAction = BaseMessageAction & {
  command: "trivia";
  subcommand: "advance";

  data: {
    triviaSessionId: string;
    questionIndex: number;
  };
};

export type TriviaQuestionMessageAction = BaseMessageAction & {
  command: "trivia";
  subcommand: "question";

  data: {
    triviaSessionId: string;
    questionIndex: number;
    answerIndex: number;
    expireTimestamp: number;
  };
};

export type MessageAction =
  | EmojiKitchenMessageAction
  | AudioUploadMessageAction
  | AudioListMessageAction
  | TriviaAdvanceMessageAction
  | TriviaQuestionMessageAction;

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
