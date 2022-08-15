import { ChatInputApplicationCommandData, Client } from "discord.js";
import hash from "object-hash";
import config from "../../services/config.js";
import { botConfigs } from "../../services/database.js";
import { getTypeDict } from "../../services/general.js";
import { EventListener } from "../index.js";

const ReadyListener: EventListener<"ready"> = async (client: Client) => {
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
  } else {
    if (oldCommandHash.value !== newCommandHash) {
      await client.application.commands.set(
        Object.values(commands),
        config.serverId
      );
    }

    oldCommandHash.value = newCommandHash;
    await botConfigs.update(oldCommandHash);
  }
};

export default ReadyListener;
