import config from "@/helpers/config.js";
import { botConfigs } from "@/helpers/database/index.js";
import { Client } from "discord.js";
import hash from "object-hash";
import { logError, logInfo } from "../../helpers/logger.js";
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
