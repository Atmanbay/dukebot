import { ChatInputApplicationCommandData, Client } from "discord.js";
import hash from "object-hash";
import { botConfigs } from "../../database/database.js";
import config from "../../utils/config.js";
import { getTypeDict } from "../../utils/general.js";
import { logError, logInfo } from "../../utils/logger.js";
import { EventListener } from "../index.js";

const ReadyListener: EventListener<"ready"> = async (client: Client) => {
  try {
    const commands = await getTypeDict<ChatInputApplicationCommandData>(
      `${process.cwd()}/src/events/interactionCreate/commands/*`
    );

    let oldCommandHash = botConfigs.get((bc) => bc.key === "commandHash");
    let newCommandHash = hash(
      Object.values(commands).map((command) => {
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
        Object.values(commands),
        config.serverId
      );

      logInfo("Bot started with brand new commands");
    } else if (oldCommandHash.value !== newCommandHash) {
      await client.application.commands.set(
        Object.values(commands),
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

export default ReadyListener;
