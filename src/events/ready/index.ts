import { Client } from "discord.js";
import hash from "object-hash";
import { botConfigs } from "../../database/database.js";
import config from "../../utils/config.js";
import { logError, logInfo } from "../../utils/logger.js";
import { EventListener } from "../index.js";
import { handlers } from "../interactionCreate/index.js";

const ReadyEventHandler: EventListener<"ready"> = async (client: Client) => {
  try {
    let oldCommandHash = botConfigs.get((bc) => bc.key === "commandHash");
    let newCommandHash = hash(
      Object.values(handlers).map((command) => {
        return {
          name: command.name,
          description: command.description,
          type: command.type,
          options: command.options,
        };
      })
    );

    if (!oldCommandHash) {
      await botConfigs.create({
        key: "commandHash",
        value: newCommandHash,
      });

      await client.application.commands.set(
        Object.values(handlers),
        config.serverId
      );

      logInfo("Bot started with brand new commands");
    } else if (oldCommandHash.value !== newCommandHash) {
      await client.application.commands.set(
        Object.values(handlers),
        config.serverId
      );

      oldCommandHash.value = newCommandHash;
      await botConfigs.update(oldCommandHash);

      logInfo("Bot started with new commands");
    } else {
      logInfo("Bot started");
    }
  } catch (error) {
    logError(error);
  }
};

export default ReadyEventHandler;
