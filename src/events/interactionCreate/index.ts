import { Interaction } from "discord.js";
import { EventListener } from "../../types/discord/eventListener";
import { getTypeDict } from "../../utils";
import { Command } from "../../types/discord/command";
import { messageActions } from "../../services/messageAction";

const commands = getTypeDict<Command>(
  `${__dirname}/../interactionCreate/commands/*`
);

const InteractionCreateHandler: EventListener<"interactionCreate"> = async (
  interaction: Interaction
) => {
  if (interaction.isButton()) {
    let interactionId = interaction.message.interaction.id;
    const messageAction = await messageActions.get(
      (ma) => ma.interactionId === interactionId
    );

    const button = messageAction.buttons.find(
      (b) => b.buttonId === interaction.customId
    );
    const command = commands[messageAction.command];
    if (command.handleButton) {
      await command.handleButton[button.type]({ interaction, messageAction });
    }
  } else if (interaction.isCommand()) {
    const commandName = interaction.commandName;
    const command = commands[commandName];
    if (typeof command.run !== "function") {
      await command.run[interaction.options.getSubcommand()](interaction);
    } else {
      await command.run(interaction);
    }

    if (!interaction.replied) {
      return interaction.reply({
        content: "Command ran but no response given. Yell at Andrew",
        ephemeral: true,
      });
    }
  }
};

export default InteractionCreateHandler;
