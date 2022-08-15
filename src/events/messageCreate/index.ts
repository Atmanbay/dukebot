import { Message } from "discord.js";
import config from "../../services/config.js";
import { getTypeDict } from "../../services/general.js";
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
  if (config.serverId !== message.guildId) {
    return;
  }

  let promises = Object.values(triggers).map((trigger) =>
    trigger.execute(message)
  );
  await Promise.all(promises);
};

export default MessageCreateHandler;
