import { Button } from "./button";
import { MessageActionData } from "./messageActionData";

export type Blaze = {
  id?: string;
  created?: number;
  userId: string;
};

export type Job = {
  id?: string;
  created?: number;
  userId: string;
  messageId?: string;
  granterUserId?: string;
  jobType: "good" | "bad";
};

export type Message = {
  id?: string;
  created?: number;
  userId: string;
  content: string;
};

export type MessageAction = {
  id?: string;
  created?: number;
  interactionId: string;
  data: MessageActionData;
  buttons: Button[];
};

export type Response = {
  id?: string;
  created?: number;
  trigger: string;
  responses: { type: "string" | "emoji" | "customEmoji"; value: string }[];
  cooldown?: number;
  lastTriggered: number;
};

export type Walkup = {
  id?: string;
  created?: number;
  userId: string;
  clip: string;
};

export type BotConfig = {
  id?: string;
  created?: number;
  key: string;
  value: string;
};

export type BaseDatabaseObject =
  | Blaze
  | Job
  | Message
  | Response
  | Walkup
  | MessageAction
  | BotConfig;
