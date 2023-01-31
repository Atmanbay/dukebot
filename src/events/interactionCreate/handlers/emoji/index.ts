import axios from "axios";
import decode from "decode-html";
import {
  ApplicationCommandOptionType,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
} from "discord.js";
/// <reference path="../types/emoji-unicode.d.ts" />
import emojiUnicode from "emoji-unicode";
import fs from "fs";
import im from "imagemagick";
import { sample } from "lodash-es";
import { createRequire } from "module";
import parse from "node-html-parser";
import config from "../../../../utils/config";
import { logError } from "../../../../utils/logger";

const require = createRequire(import.meta.url);
const emojidata = require("unicode-emoji-json");

export const data: ChatInputApplicationCommandData = {
  name: "Emoji",
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
  const query = interaction.options.getString("query");

  let escapedWord = encodeURI(query);
  let url = `https://www.urbandictionary.com/define.php?term=${escapedWord}`;

  const response = await axios(url);
  if (response.status !== 200) {
    await interaction.reply({
      content:
        "An HTTP error occurred when trying to fetch your definition. . Please try again later.",
      ephemeral: true,
    });
    return;
  }
  let root = parse(response.data);

  let definitions = root.querySelectorAll(".definition");
  if (definitions.length === 0) {
    return null;
  }

  let randomDefinition = sample(definitions);

  let definition = randomDefinition.querySelector("div.meaning");
  let example = randomDefinition.querySelector("div.example");

  let message = [
    `**${query}**`,
    "",
    decode(definition.structuredText),
    "",
    `_${decode(example.structuredText)}_`,
  ];

  await interaction.reply({
    content: message.join("\n"),
  });
};
