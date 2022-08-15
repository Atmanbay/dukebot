/// <reference path="../types/emoji-unicode.d.ts" />
import emojiUnicode from "emoji-unicode";
import fs from "fs";
import im from "imagemagick";
import ne from "node-emoji";
import request from "request-promise-native";
import config from "./config.js";
const find = ne.find;

export const getEmojiPath = async (a: string, b: string) => {
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

export const getEmojiByName = (emojiName: string) => {
  return find(emojiName);
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

  let url = await makeEmojiKitchenRequest(aUnicode, bUnicode, 20201001);

  if (!url) {
    url = await makeEmojiKitchenRequest(bUnicode, aUnicode, 20201001);
  }

  if (!url) {
    url = await makeEmojiKitchenRequest(aUnicode, bUnicode, 20211115);
  }

  if (!url) {
    url = await makeEmojiKitchenRequest(bUnicode, aUnicode, 20211115);
  }

  if (url) {
    return new Promise((resolve) => {
      request({ uri: url })
        .pipe(fs.createWriteStream(path))
        .on("close", () => {
          im.resize(
            {
              srcPath: path,
              dstPath: path,
              width: 64,
            },
            (err) => {
              if (err) {
                console.log(err);
              }
              resolve(path);
            }
          );
        });
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
  let baseUrl = "https://www.gstatic.com/android/keyboard/emojikitchen";

  let url = `${baseUrl}/${number}/${unicodeToGoogleUrl(
    firstUnicodeArray
  )}/${unicodeToGoogleUrl(firstUnicodeArray)}_${unicodeToGoogleUrl(
    secondUnicodeArray
  )}.png`;

  return request
    .head(url)
    .then(() => url)
    .catch(() => "");
};

export const getCombinedEmojiName = (a: string, b: string) => {
  return `${find(a).key}_${find(b).key}`.substring(0, 32);
};
