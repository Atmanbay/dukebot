import { Client } from "discord.js";
import hash from "object-hash";
import { botConfigs } from "../../database/database.js";
import config from "../../utils/config.js";
import { logError, logInfo } from "../../utils/logger.js";
import { EventListener } from "../index.js";
import { commandData } from "../interactionCreate/index.js";

const ReadyEventHandler: EventListener<"ready"> = async (client: Client) => {
  try {
    let oldCommandHashObject = botConfigs.get((bc) => bc.key === "commandHash");
    let newCommandHash = hash(commandData);

    if (!oldCommandHashObject) {
      await botConfigs.create({
        key: "commandHash",
        value: newCommandHash,
      });

      await client.application.commands.set(commandData, config.serverId);
      logInfo("Bot started with new commands");
    } else if (oldCommandHashObject.value !== newCommandHash) {
      await client.application.commands.set(commandData, config.serverId);

      oldCommandHashObject.value = newCommandHash;
      await botConfigs.update(oldCommandHashObject);

      logInfo("Bot started with new commands");
    } else {
      logInfo("Bot started");
    }
  } catch (error) {
    logError(error);
  }
};

export default ReadyEventHandler;
