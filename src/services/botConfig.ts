import { BotConfig } from "../types/database.js";
import { DatabaseTable } from "./database.js";

export const botConfigs = new DatabaseTable<BotConfig>("botConfigs");
