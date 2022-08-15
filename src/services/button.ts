import { MessageActionRow, MessageButton } from "discord.js";
import { Button } from "../models/button.js";

export const buildMessageActionRow = (buttons: Button[]) => {
  const messageButtons: MessageButton[] = [];
  buttons.forEach((button) => {
    let label = "";
    if (button.label && button.label.length > 0) {
      label = button.label;
    } else {
      label = `${button.type[0].toUpperCase()}${button.type.substring(1)}`;
    }

    const messageButton = new MessageButton()
      .setCustomId(button.buttonId)
      .setLabel(label)
      .setStyle(button.style);
    messageButtons.push(messageButton);
  });

  return new MessageActionRow().addComponents(messageButtons);
};
