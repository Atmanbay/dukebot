import axios from "axios";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
} from "discord.js";
import emojiUnicode from "emoji-unicode";
import { createWriteStream, existsSync } from "fs";
import im from "imagemagick";
import { createRequire } from "module";
import { Feature } from "..";
import { getSingletonTable } from "../../database/database.js";
import { InteractionContext } from "../../database/models.js";
import config from "../../utils/config.js";
import { logError } from "../../utils/logger.js";

const require = createRequire(import.meta.url);
const emojidata = require("unicode-emoji-json");

const interactionContexts = await getSingletonTable<InteractionContext>(
  "interactionContexts"
);

type EmojiKitchenResponse = {
  locale: string;
  results: Result[];
  next: string;
};

type Result = {
  id: string;
  title: string;
  content_rating: string;
  media_formats: {
    png_transparent: {
      url: string;
      duration: number;
      preview: string;
      dims: number[];
      size: number;
    };
  };
  bg_color: string;
  created: number;
  content_description: string;
  h1_title: string;
  long_title: string;
  embed: string;
  itemurl: string;
  url: string;
  tags: string[];
  flags: string[];
  hasaudio: boolean;
  source_id: string;
  shares: number;
  copied_post_pid: string;
  policy_status: string;
};

const getEmojiPath = async (a: string, b: string) => {
  let fileName = emojiToFilename(a, b);
  let path = `${config.paths.emojiKitchen}/${fileName}`;

  if (!existsSync(path)) {
    let url = await getEmojiUrl(a, b);
    path = await downloadEmoji(url, path);
  }

  if (!path || !existsSync(path)) {
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

const getEmojiUrl = async (a: string, b: string) => {
  // please don't get mad at me google
  const baseUrl = "https://tenor.googleapis.com/v2/featured";

  const params = {
    key: config.emojiKitchen.apiKey,
    client_key: "emoji_kitchen_funbox",
    q: encodeURI(`${a}_${b}`),
    collection: "emoji_kitchen_v6",
    contentfilter: "high",
  };

  const headers = {
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    Origin: "https://www.google.com",
    Referer: "https://www.google.com/",
    "Sec-Ch-Ua":
      '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "X-Client-Data": config.emojiKitchen.clientData,
  };

  const response = await axios.get<EmojiKitchenResponse>(
    `${baseUrl}?${Object.entries(params)
      .map(([key, val]) => `${key}=${val}`)
      .join("&")}`,
    {
      headers: headers,
    }
  );

  return response.data.results[0].url;
};

const downloadEmoji = async (url: string, path: string): Promise<string> => {
  const response = await axios({ url: url, responseType: "stream" });

  return new Promise((resolve) => {
    response.data.pipe(createWriteStream(path)).on("close", () => {
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
    });
  });
};

const getCombinedEmojiName = (a: string, b: string) => {
  return `${emojidata[a].slug}_${emojidata[b].slug}`.substring(0, 32);
};

const handler = async (interaction: ChatInputCommandInteraction) => {
  const first = interaction.options.getString("first");
  const second = interaction.options.getString("second");

  let path = await getEmojiPath(first, second);
  if (path) {
    await interactionContexts.create({
      interactionId: interaction.id,
      context: {
        path,
        emojiName: getCombinedEmojiName(first, second),
      },
    });

    const button = new ButtonBuilder()
      .setCustomId("saveEmoji")
      .setLabel("Save")
      .setStyle(ButtonStyle.Primary);

    const actionRowBuilder =
      new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    let attachment = new AttachmentBuilder(path);
    await interaction.reply({
      content: `${first} + ${second}`,
      files: [attachment],
      components: [actionRowBuilder],
    });
  } else {
    await interaction.reply({
      content: "That emoji combo does not exist",
      ephemeral: true,
    });
  }
};

const saveEmojiHandler = async (
  interaction: ButtonInteraction,
  context: InteractionContext
) => {
  await interaction.guild.emojis.create({
    attachment: context.context.path,
    name: context.context.emojiName,
  });

  await interaction.reply({
    content: `Emoji saved as \`:${context.context.emojiName}:\``,
    ephemeral: true,
  });
};

const emoji: Feature = {
  load: async (loaders) => {
    loaders.commands.load({
      type: ApplicationCommandType.ChatInput,
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
    });

    loaders.chatInput.load({ commandTree: ["emoji"], handler });

    loaders.buttons.load({ id: "saveEmoji", handler: saveEmojiHandler });
  },
};

export default emoji;
