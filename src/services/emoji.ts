import config from "../utils/config";

// const emojiUnicode = require("emoji-unicode");
// const emojiUtil = require("node-emoji");
// const fs = require("fs");
// const request = require("request-promise-native");
// const im = require("imagemagick");

import emojiUnicode from "emoji-unicode";
import { find } from "node-emoji";
import fs from "fs";
import request from "request-promise-native";
import im from "imagemagick";

const fetchEmoji = async (a: string, b: string) => {
  let fileName = getEmojiFilename(a, b);
  let path = `${config.paths.emojiKitchen}/${fileName}`;

  if (!fs.existsSync(path)) {
    path = await downloadEmoji(a, b, path);
  }

  if (!path || !fs.existsSync(path)) {
    return null;
  }

  return path;
};

const getEmoji = (emojiName: string) => {
  return find(emojiName);
};

const getEmojiCode = (emoji: string): string[] => {
  return emojiUnicode(emoji).split(" ");
};

const getFormattedEmojiCode = (emojiCode: string[]) => {
  return emojiCode.map((ec) => `u${ec}`).join("-");
};

const getEmojiFilename = (a: string, b: string) => {
  let aUnicode = getEmojiCode(a);
  let bUnicode = getEmojiCode(b);

  if (parseInt(aUnicode[0], 16) > parseInt(bUnicode[0], 16)) {
    return `${getFormattedEmojiCode(bUnicode)}_${getFormattedEmojiCode(
      aUnicode
    )}.png`;
  } else {
    return `${getFormattedEmojiCode(aUnicode)}_${getFormattedEmojiCode(
      bUnicode
    )}.png`;
  }
};

const downloadEmoji = async (
  a: string,
  b: string,
  path: string
): Promise<string> => {
  let aUnicode = getEmojiCode(a);
  let bUnicode = getEmojiCode(b);

  let url = await makeRequest(aUnicode, bUnicode, 20201001);

  if (!url) {
    url = await makeRequest(bUnicode, aUnicode, 20201001);
  }

  if (!url) {
    url = await makeRequest(aUnicode, bUnicode, 20211115);
  }

  if (!url) {
    url = await makeRequest(bUnicode, aUnicode, 20211115);
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

const makeRequest = async (
  first: string,
  second: string,
  number: number
): Promise<string> => {
  let baseUrl = "https://www.gstatic.com/android/keyboard/emojikitchen";

  let url = `${baseUrl}/${number}/${getFormattedEmojiCode(
    first
  )}/${getFormattedEmojiCode(first)}_${getFormattedEmojiCode(second)}.png`;

  return request
    .head(url)
    .then(() => url)
    .catch(() => "");
};

const getCombinedEmojiName = (a: string, b: string) => {
  return `${find(a).key}_${find(b).key}`.substring(0, 32);
};
