import { Message } from "discord.js";
import config from "../../utils/config.js";
import { getTypeDict } from "../../utils/general.js";
import { logError } from "../../utils/logger.js";
import { EventListener } from "../index.js";

export interface Trigger {
  execute: (message: Message) => Promise<void>;
}

const triggers = await getTypeDict<Trigger>(
  `${process.cwd()}/src/events/messageCreate/triggers/*`
);

const MessageCreateHandler: EventListener<"messageCreate"> = async (
  message: Message
) => {
  try {
    if (config.serverId !== message.guild.id) {
      return;
    }

    let promises = Object.values(triggers).map((trigger) =>
      trigger.execute(message)
    );
    await Promise.all(promises);
  } catch (error) {
    logError(error);
  }
};

export default MessageCreateHandler;
