import axios from "axios";
import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ButtonStyle,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
} from "discord.js";
/// <reference path="../types/emoji-unicode.d.ts" />
import emojiUnicode from "emoji-unicode";
import fs from "fs";
import im from "imagemagick";
import { createRequire } from "module";
import { messageActions } from "../../../../database/database.js";
import { Button } from "../../../../database/models.js";
import config from "../../../../utils/config.js";
import {
  buildMessageActionRow,
  generateId,
} from "../../../../utils/general.js";
import { logError } from "../../../../utils/logger.js";

const require = createRequire(import.meta.url);
const emojidata = require("unicode-emoji-json");

export const data: ChatInputApplicationCommandData = {
  name: "emoji",
  description: "Combines two emojis using Google's Emoji Kitchen",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "first",
      description: "The first emoji to combine",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "second",
      description: "The second emoji to combine",
      required: true,
    },
  ],
};

const getEmojiPath = async (a: string, b: string) => {
  let fileName = emojiToFilename(a, b);
  let path = `${config.paths.emojiKitchen}/${fileName}`;

  if (!fs.existsSync(path)) {
    path = await downloadEmoji(a, b, path);
  }

  if (!path || !fs.existsSync(path)) {
    return null;
  }

  return path;
};

const emojiToUnicodeArray = (emoji: string): string[] => {
  return emojiUnicode(emoji).split(" ");
};

const unicodeToGoogleUrl = (emojiUnicode: string[]) => {
  return emojiUnicode.map((ec) => `u${ec}`).join("-");
};

const emojiToFilename = (a: string, b: string) => {
  let aUnicode = emojiToUnicodeArray(a);
  let bUnicode = emojiToUnicodeArray(b);

  if (parseInt(aUnicode[0], 16) > parseInt(bUnicode[0], 16)) {
    return `${unicodeToGoogleUrl(bUnicode)}_${unicodeToGoogleUrl(
      aUnicode
    )}.png`;
  } else {
    return `${unicodeToGoogleUrl(aUnicode)}_${unicodeToGoogleUrl(
      bUnicode
    )}.png`;
  }
};

const downloadEmoji = async (
  a: string,
  b: string,
  path: string
): Promise<string> => {
  let aUnicode = emojiToUnicodeArray(a);
  let bUnicode = emojiToUnicodeArray(b);

  let url = "";
  let dates = [20201001, 20211115, 20220406];
  for (let i = 0; i < dates.length; i++) {
    let date = dates[i];
    url =
      (await makeEmojiKitchenRequest(bUnicode, aUnicode, date)) ??
      (await makeEmojiKitchenRequest(aUnicode, bUnicode, date));
    if (url) {
      break;
    }
  }

  if (url) {
    return new Promise((resolve) => {
      axios({ url: url, responseType: "stream" }).then((response) =>
        response.data.pipe(fs.createWriteStream(path)).on("close", () => {
          im.resize(
            {
              srcPath: path,
              dstPath: path,
              width: 128,
            },
            (err) => {
              if (err) {
                logError(err);
              }
              resolve(path);
            }
          );
        })
      );
    });
  } else {
    return null;
  }
};

const makeEmojiKitchenRequest = async (
  firstUnicodeArray: string[],
  secondUnicodeArray: string[],
  number: number
): Promise<string> => {
  try {
    let baseUrl = "https://www.gstatic.com/android/keyboard/emojikitchen";

    let url = `${baseUrl}/${number}/${unicodeToGoogleUrl(
      firstUnicodeArray
    )}/${unicodeToGoogleUrl(firstUnicodeArray)}_${unicodeToGoogleUrl(
      secondUnicodeArray
    )}.png`;

    const response = await axios({ method: "head", url: url });
    if (response.status === 200) {
      return url;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const getCombinedEmojiName = (a: string, b: string) => {
  return `${emojidata[a].slug}_${emojidata[b].slug}`.substring(0, 32);
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  const first = interaction.options.getString("first");
  const second = interaction.options.getString("second");

  let path = await getEmojiPath(first, second);
  if (path) {
    const buttons: Button[] = [
      {
        type: "save",
        label: "Save",
        buttonId: generateId(),
        style: ButtonStyle.Primary,
      },
    ];

    const messageActionRow = buildMessageActionRow(buttons);

    let attachment = new AttachmentBuilder(path);
    await interaction.reply({
      content: `${first} + ${second}`,
      files: [attachment],
      components: [messageActionRow],
    });

    await messageActions.create({
      interactionId: interaction.id,
      command: "emoji",
      subcommand: "combine",
      data: {
        path,
        emojiName: getCombinedEmojiName(first, second),
      },
      buttons,
    });
  } else {
    await interaction.reply({
      content: "That emoji combo does not exist",
      ephemeral: true,
    });
  }
};
