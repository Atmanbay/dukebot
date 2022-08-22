import { ClientEvents } from "discord.js";
import InteractionCreateHandler from "./interactionCreate/index.js";
import MessageCreateHandler from "./messageCreate/index.js";
import MessageReactionAddHandler from "./messageReactionAdd/index.js";
import MessageReactionRemoveHandler from "./messageReactionRemove/index.js";
import ReadyListener from "./ready/index.js";
import VoiceStateUpdateEventHandler from "./voiceStateUpdate/index.js";

export type EventListener<K extends keyof ClientEvents> = (
  ...args: ClientEvents[K]
) => Promise<void>;

export const eventListeners: {
  [Key in keyof ClientEvents]?: EventListener<any>;
} = {
  interactionCreate: InteractionCreateHandler,
  messageCreate: MessageCreateHandler,
  messageReactionAdd: MessageReactionAddHandler,
  messageReactionRemove: MessageReactionRemoveHandler,
  ready: ReadyListener,
  voiceStateUpdate: VoiceStateUpdateEventHandler,
};
