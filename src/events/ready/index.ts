import { Client, ChatInputApplicationCommandData } from "discord.js";
import { botConfigs } from "../../services/botConfig";
import { Command } from "../../types/discord/command";
import { EventListener } from "../../types/discord/eventListener";
import { getTypeDict } from "../../utils";
import hash from "object-hash";
import config from "../../utils/config";

const commands = getTypeDict<Command>(
  `${__dirname}/../interactionCreate/commands/*`
);
const ReadyListener: EventListener<"ready"> = async (client: Client) => {
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
