import { Message } from "../types/database.js";
import { DatabaseTable } from "./database.js";

export const messages = new DatabaseTable<Message>("messages");
