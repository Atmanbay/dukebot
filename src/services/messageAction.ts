import { MessageAction } from "../types/database";
import { DatabaseTable } from "../database";

export const messageActions = new DatabaseTable<MessageAction>(
  "messageActions"
);
