import { MessageAttachment } from "discord.js";
/// <reference path="../types/emoji-unicode.d.ts" />
import emojiUnicode from "emoji-unicode";
import fs from "fs";
import im from "imagemagick";
import ne from "node-emoji";
import request from "request-promise-native";
import { messageActions } from "../../../database/database.js";
import config from "../../../utils/config.js";
import { buildMessageActionRow, generateId } from "../../../utils/general.js";
import { InteractionCreateHandler } from "../index.js";
const find = ne.find;

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

const EmojiInteractionCreateHandler: InteractionCreateHandler = {
  name: "emoji",
  description: "Combines two emojis using Google's Emoji Kitchen",
  options: [
    {
      type: "STRING",
      name: "first",
      description: "The first emoji to combine",
      required: true,
    },
    {
      type: "STRING",
      name: "second",
      description: "The second emoji to combine",
      required: true,
    },
  ],
  handle: async (interaction) => {
    const first = interaction.options.getString("first");
    const second = interaction.options.getString("second");

    let path = await getEmojiPath(first, second);
    if (path) {
      const messageAction = await messageActions.create({
        interactionId: interaction.id,
        data: {
          command: "emoji",
          subcommand: "combine",
          path,
          emojiName: getCombinedEmojiName(first, second),
        },
        buttons: [
          {
            type: "save",
            label: "Save",
            buttonId: generateId(),
            style: "PRIMARY",
          },
        ],
      });

      const messageActionRow = buildMessageActionRow(messageAction.buttons);

      let attachment = new MessageAttachment(path);
      await interaction.reply({
        content: `${first} + ${second}`,
        files: [attachment],
        components: [messageActionRow],
      });
    } else {
      await interaction.reply({
        content: "That emoji combo does not exist",
        ephemeral: true,
      });
    }
  },
  handleButton: {
    save: async ({ interaction, messageAction }) => {
      if (messageAction.data.subcommand !== "combine") {
        return;
      }

      await interaction.guild.emojis.create(
        messageAction.data.path,
        messageAction.data.emojiName
      );

      await interaction.reply({
        content: `Emoji saved as \`:${messageAction.data.emojiName}:\``,
        ephemeral: true,
      });
    },
  },
};

export default EmojiInteractionCreateHandler;
