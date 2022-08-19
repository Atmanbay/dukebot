import { Message } from "discord.js";
import config from "../../utils/config.js";
import { logError } from "../../utils/logger.js";
import { EventListener } from "../index.js";
import Blaze from "./triggers/blaze.js";
import MessageSaving from "./triggers/messageSaving.js";
import Response from "./triggers/response.js";

export interface Trigger {
  execute: (message: Message) => Promise<void>;
}

const triggers = [Blaze, MessageSaving, Response];

const MessageCreateHandler: EventListener<"messageCreate"> = async (
  message: Message
) => {
  try {
    if (config.serverId !== message.guild.id) {
      return;
    }

    let promises = triggers.map((trigger) => trigger.execute(message));
    await Promise.all(promises);
  } catch (error) {
    logError(error);
  }
};

export default MessageCreateHandler;
