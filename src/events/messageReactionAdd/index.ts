import {
  Message,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import { logError } from "../../utils/logger.js";
import { EventListener } from "../index.js";
import DownvoteMessageReactionAddHandler from "./handlers/downvote.js";
import UpvoteMessageReactionAddHandler from "./handlers/upvote.js";

export interface MessageReactionAddHandler {
  execute: (message: Message, user: User) => Promise<void>;
}

const handlers = {
  upvote: UpvoteMessageReactionAddHandler,
  downvote: DownvoteMessageReactionAddHandler,
};

const MessageReactionAddEventHandler: EventListener<
  "messageReactionAdd"
> = async (
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

export default MessageReactionAddEventHandler;
