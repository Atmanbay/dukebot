import { ClientEvents } from "discord.js";
import { getTypeDict } from "../services/general.js";

export type EventListener<K extends keyof ClientEvents> = (
  ...args: ClientEvents[K]
) => Promise<void>;

export const eventListeners = await getTypeDict<EventListener<any>>(
  `${process.cwd()}/src/events/**/index.ts`,
  { ignore: `${process.cwd()}/src/events/index.ts` }
);
