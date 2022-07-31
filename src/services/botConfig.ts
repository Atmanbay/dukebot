import { BotConfig } from "../types/database";
import { DatabaseTable } from "../database";

export const botConfigs = new DatabaseTable<BotConfig>("botConfigs");
