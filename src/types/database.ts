import { MessageButtonStyleResolvable } from "discord.js";

export type Blaze = {
  id?: string;
  created?: string;
  userId: string;
};

export type PreviousPageButton = {
  type: "previousPage";
  id?: string;
  buttonId: string;
  label?: string;
  style?: MessageButtonStyleResolvable;
};

export type NextPageButton = {
  type: "nextPage";
  id?: string;
  buttonId: string;
  label?: string;
  style?: MessageButtonStyleResolvable;
};

export type SetButton = {
  type: "set";
  id?: string;
  buttonId: string;
  label?: string;
  style?: MessageButtonStyleResolvable;
};

export type ApproveButton = {
  type: "approve";
  id?: string;
  buttonId: string;
  label?: string;
  style?: MessageButtonStyleResolvable;
};

export type DisapproveButton = {
  type: "disapprove";
  id?: string;
  buttonId: string;
  label?: string;
  style?: MessageButtonStyleResolvable;
};

export type CancelButton = {
  type: "cancel";
  id?: string;
  buttonId: string;
  label?: string;
  style?: MessageButtonStyleResolvable;
};

export type Button =
  | PreviousPageButton
  | NextPageButton
  | SetButton
  | ApproveButton
  | DisapproveButton
  | CancelButton;

// export type Button = {
//   type:
//     | "previousPage"
//     | "nextPage"
//     | "set"
//     | "approve"
//     | "disapprove"
//     | "cancel";
//   id?: string;
//   buttonId: string;
//   label?: string;
//   style?: MessageButtonStyleResolvable;
// };

export type AudioUploadMessageAction = {
  command: "audio";
  subcommand: "upload";
  id?: string;
  interactionId: string;
  clipName: string;
  buttons: Button[];
};

export type AudioListMessageAction = {
  command: "audio";
  subcommand: "list";
  id?: string;
  interactionId: string;
  currentPage: number;
  query?: string;
  buttons: Button[];
};

export type TwitterTweetMessageAction = {
  command: "twitter";
  subcommand: "tweet";
  id?: string;
  interactionId: string;
  approvals: string[];
  required: number;
  content: string;
  buttons: Button[];
};

export type TwitterReplyMessageAction = {
  command: "twitter";
  subcommand: "reply";
  id?: string;
  interactionId: string;
  approvals: string[];
  required: number;
  content: string;
  targetTweetId: string;
  buttons: Button[];
};

export type TwitterRetweetMessageAction = {
  command: "twitter";
  subcommand: "retweet";
  id?: string;
  interactionId: string;
  approvals: string[];
  required: number;
  targetTweetId: string;
  buttons: Button[];
};

export type TwitterQuoteTweetMessageAction = {
  command: "twitter";
  subcommand: "quotetweet";
  id?: string;
  interactionId: string;
  approvals: string[];
  required: number;
  content: string;
  targetTweetUrl: string;
  buttons: Button[];
};

export type MessageAction =
  | AudioUploadMessageAction
  | AudioListMessageAction
  | TwitterTweetMessageAction
  | TwitterReplyMessageAction
  | TwitterRetweetMessageAction
  | TwitterQuoteTweetMessageAction;

export enum JobType {
  GOOD,
  BAD,
}

export type Job = {
  id?: string;
  created?: string;
  userId: string;
  jobType: JobType;
};

export type Message = {
  id?: string;
  userId: string;
  content: string;
};

export type Response = {
  id?: string;
  trigger: string;
  responses: string[];
  cooldown?: number;
  lastTriggered: string;
};

export type Walkup = {
  id?: string;
  userId: string;
  clip: string;
};

export type BotConfig = {
  id?: string;
  key: string;
  value: string;
};

export type BaseDatabaseObject =
  | Blaze
  | Button
  | Job
  | Message
  | Response
  | Walkup
  | MessageAction
  | BotConfig;
