import { Client } from "discord.js";
import { botConfigs } from "../../services/botConfig.js";
import { Command } from "../../types/discord/command.js";
import { EventListener } from "../../types/discord/eventListener.js";
import { getTypeDict } from "../../utils/index.js";
import hash from "object-hash";
import config from "../../utils/config.js";

const ReadyListener: EventListener<"ready"> = async (client: Client) => {
  const commands = await getTypeDict<Command>(
    `${process.cwd()}/src/events/interactionCreate/commands/*`
  );

  let oldCommandHash = await botConfigs.get((bc) => bc.key === "commandHash");
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
