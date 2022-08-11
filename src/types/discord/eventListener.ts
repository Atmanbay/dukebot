import { ClientEvents } from "discord.js";

export type EventListener<K extends keyof ClientEvents> = (
  ...args: ClientEvents[K]
) => Promise<void>;
