import crypto from "crypto";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import glob from "glob";
import moment from "moment-timezone";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { Button } from "../database/models.js";

export const __dirname = (path: string) => {
  return dirname(fileURLToPath(path));
};

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

    if (button.emoji) {
      messageButton.setEmoji(button.emoji);
    }

    if (button.disabled) {
      messageButton.setDisabled(button.disabled);
    }

    messageButtons.push(messageButton);
  });

  return new MessageActionRow().addComponents(messageButtons);
};

export const getFiles = (path: string) => {
  return glob.sync(path);
};

export const getTimestamp = () => {
  return moment().valueOf();
};

export const generateId = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const buildTable = ({
  leftColumnWidth,
  rightColumnWidth,
  rows,
}: {
  leftColumnWidth: number;
  rightColumnWidth: number;
  rows: [string, string][];
}) => {
  let columnWidths = [leftColumnWidth, rightColumnWidth];

  return rows.map((row) => {
    let rowString = "";

    for (let col = 0; col < row.length; col++) {
      let cell = "";
      if (row[col]) {
        cell = String(row[col]);
      }
      let width = columnWidths[col];

      rowString += cell;
      let diff = width - cell.length;
      let buffer = "";
      for (let i = 0; i < diff; i++) {
        buffer += " ";
      }

      rowString += buffer;
    }

    return rowString;
  });
};

export const buildEmbed = ({
  title,
  content,
  image,
}: {
  title: string;
  content?: string;
  image?: string;
}) => {
  const embed = {
    title: title,
  } as MessageEmbed;

  if (content) {
    embed.description = content;
  }

  if (image) {
    embed.image = { url: image, height: 0, width: 0 };
  }

  return embed;
};
