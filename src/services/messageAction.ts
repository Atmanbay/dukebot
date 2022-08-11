import { MessageAction } from "../types/database.js";
import { DatabaseTable } from "./database.js";

export const messageActions = new DatabaseTable<MessageAction>(
  "messageActions"
);
