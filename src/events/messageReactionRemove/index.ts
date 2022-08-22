import {
  Message,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import { logError } from "../../utils/logger.js";
import { EventListener } from "../index.js";
import DownvoteMessageReactionRemoveHandler from "./handlers/downvote.js";
import UpvoteMessageReactionRemoveHandler from "./handlers/upvote.js";

export interface MessageReactionRemoveHandler {
  execute: (message: Message, user: User) => Promise<void>;
}

const handlers = {
  upvote: UpvoteMessageReactionRemoveHandler,
  downvote: DownvoteMessageReactionRemoveHandler,
};

const MessageReactionRemoveEventHandler: EventListener<
  "messageReactionRemove"
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

export default MessageReactionRemoveEventHandler;
