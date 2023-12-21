import config from "@/helpers/config.js";
import { Message } from "discord.js";
import { logError } from "../../helpers/logger.js";
import { EventListener } from "../index.js";
import BlazeMessageCreateHandler from "./handlers/blaze.js";
import MessageSavingMessageCreateHandler from "./handlers/messageSaving.js";
import ResponseMessageCreateHandler from "./handlers/response.js";

export interface MessageCreateHandler {
  execute: (message: Message) => Promise<void>;
}

const handlers = [
  BlazeMessageCreateHandler,
  MessageSavingMessageCreateHandler,
  ResponseMessageCreateHandler,
];

const MessageCreateEventHandler: EventListener<"messageCreate"> = async (
  message: Message
) => {
  try {
    if (config.serverId !== message.guild.id) {
      return;
    }

    let promises = handlers.map((trigger) => trigger.execute(message));
    await Promise.all(promises);
  } catch (error) {
    logError(error);
  }
};

export default MessageCreateEventHandler;
