import { Button } from "@/helpers/database/models.js";
import crypto from "crypto";
import { ActionRowBuilder, ButtonBuilder, Embed } from "discord.js";
import { globSync } from "glob";
import moment from "moment-timezone";
import { dirname } from "path";
import { fileURLToPath } from "url";

export const __dirname = (path: string) => {
  return dirname(fileURLToPath(path));
};

export const buildMessageActionRow = (buttons: Button[]) => {
  const messageButtons: ButtonBuilder[] = [];
  buttons.forEach((button) => {
    let label = "";
    if (button.label && button.label.length > 0) {
      label = button.label;
    } else {
      label = `${button.type[0].toUpperCase()}${button.type.substring(1)}`;
    }

    const messageButton = new ButtonBuilder()
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

  return new ActionRowBuilder().addComponents(
    messageButtons
  ) as ActionRowBuilder<ButtonBuilder>;
};

export const getFiles = (path: string) => {
  return globSync(path);
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
  return {
    title: title,
    description: content,
    image: { url: image, height: 0, width: 0 },
  } as Embed;
};
