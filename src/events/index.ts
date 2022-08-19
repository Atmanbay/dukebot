import { ClientEvents } from "discord.js";
import InteractionCreateHandler from "./interactionCreate/index.js";
import MessageCreateHandler from "./messageCreate/index.js";
import MessageReactionAddHandler from "./messageReactionAdd/index.js";
import MessageReactionRemoveHandler from "./messageReactionRemove/index.js";
import ReadyListener from "./ready/index.js";
import VoiceStateUpdateHandler from "./voiceStateUpdate/index.js";

export type EventListener<K extends keyof ClientEvents> = (
  ...args: ClientEvents[K]
) => Promise<void>;

export const eventListeners = {
  interactionCreate: InteractionCreateHandler,
  messageCreate: MessageCreateHandler,
  messageReactionAdd: MessageReactionAddHandler,
  messageReactionRemove: MessageReactionRemoveHandler,
  ready: ReadyListener,
  voiceStatusUpdate: VoiceStateUpdateHandler,
};
