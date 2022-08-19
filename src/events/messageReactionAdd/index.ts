import {
  Message,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import { logError } from "../../utils/logger.js";
import { EventListener } from "../index.js";
import Downvote from "./handlers/downvote.js";
import Upvote from "./handlers/upvote.js";

export interface Handler {
  execute: (message: Message, user: User) => Promise<void>;
}

const handlers = {
  upvote: Upvote,
  downvote: Downvote,
};

const MessageReactionAddHandler: EventListener<"messageReactionAdd"> = async (
  messageReaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser
) => {
  try {
    let handler = handlers[messageReaction.emoji.name];
    if (handler) {
      handler.execute(messageReaction.message as Message, user as User);
    }
  } catch (error) {
    logError(error);
  }
};

export default MessageReactionAddHandler;
