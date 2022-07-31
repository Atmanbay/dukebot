import { Message } from "../types/database";
import { DatabaseTable } from "../database";

export const messages = new DatabaseTable<Message>("messages");
