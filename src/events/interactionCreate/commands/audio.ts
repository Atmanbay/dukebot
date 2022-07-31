import { Command } from "../../../types/discord/command";
import { play, getClips } from "../../../services/audio";
import { GuildMember, VoiceChannel } from "discord.js";
import config from "../../../utils/config";
import { existsSync } from "fs";
import download from "download";
import sanitize from "sanitize-filename";
import { buildMessageActionRow } from "../../../services/button";
import { walkups } from "../../../services/walkup";
import { buildTable, generateId } from "../../../utils";
import { messageActions } from "../../../services/messageAction";

const getPages = () => {
  const clipNames = getClips();
  let perChunk = 20;
  let chunkedClips = clipNames.reduce((all, one, i) => {
    const ch = Math.floor(i / perChunk);
    all[ch] = [].concat(all[ch] || [], one);
    return all;
  }, []);

  return chunkedClips;
};

const getPageOfClips = (pageNumber: number) => {
  let pages = getPages();
  let firstPage = [...pages[pageNumber]];
  let buffer = 5;
  let columnWidth = Math.max(...firstPage.map((c) => c.length)) + buffer;
  let halfway = Math.ceil(firstPage.length / 2);
  let leftColumn = firstPage.splice(0, halfway);

  let rows: [string, string][] = [];
  for (let i = 0; i < halfway; i++) {
    let row: [string, string] = [leftColumn.shift(), firstPage.shift()];
    rows.push(row);
  }

  let page = buildTable({
    leftColumnWidth: columnWidth,
    rightColumnWidth: columnWidth,
    rows: rows,
  });
  page.unshift("```");
  page.push("```");
  return page;
};

const Alive: Command = {
  name: "audio",
  description: "Play, upload, or list audio clips",
  type: "CHAT_INPUT",
  options: [
    {
      type: "SUB_COMMAND",
      name: "play",
      description: "Play a clip in the designated audio channel",
      options: [
        {
          type: "STRING",
          name: "name",
          description: "Name of clip to play",
          required: true,
        },
        {
          type: "CHANNEL",
          name: "channel",
          description:
            "Audio channel to play the clip in (defaults to caller's current channel)",
        },
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "upload",
      description: "Upload your most recently posted audio clip",
      options: [
        {
          type: "STRING",
          name: "name",
          description: "Name to give clip",
          required: true,
        },
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "list",
      description: "Lists all audio clips alphabetized by name",
    },
  ],
  run: {
    play: async (interaction) => {
      const clipName = interaction.options.getString("name");
      let channel = interaction.options.getChannel("channel") as VoiceChannel;
      if (!channel) {
        channel = (interaction.member as GuildMember).voice
          .channel as VoiceChannel;
      }

      let path = `${config.paths.audio}/${clipName}.mp3`;

      if (!existsSync(path)) {
        await interaction.reply({
          content: `Clip named ${clipName} not found`,
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        content: `Playing \`${clipName}\` in \`${channel.name}\``,
      });

      await play(channel, path);
    },
    upload: async (interaction) => {
      await interaction.channel.messages
        .fetch({ limit: 25 })
        .then(async (messages) => {
          let author = interaction.member as GuildMember;
          let fromUser = messages.find(
            (message) =>
              message.author.id == author.id &&
              message.attachments &&
              message.attachments.size == 1
          );

          if (fromUser) {
            let url = fromUser.attachments.first().url;
            let rawFileName = interaction.options.getString("name");
            if (!rawFileName) {
              rawFileName = fromUser.attachments.first().name;
            }

            let sanitized = sanitize(rawFileName);
            let options = {
              filename: `${sanitized}.mp3`,
            };
            await download(url, config.paths.audio, options);

            const messageAction = await messageActions.create({
              command: "audio",
              subcommand: "upload",
              interactionId: interaction.id,
              clipName: sanitized,
              buttons: [
                {
                  type: "set",
                  label: "Set as Walkup",
                  buttonId: generateId(),
                  style: "PRIMARY",
                },
              ],
            });

            const messageActionRow = buildMessageActionRow(
              messageAction.buttons
            );

            await interaction.reply({
              content: `Successfully uploaded ${rawFileName}`,
              components: [messageActionRow],
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content:
                "Please upload an audio file and then call this command (if uploaded 25+ messages ago you need to re-upload)",
              ephemeral: true,
            });
          }
        });
    },
    list: async (interaction) => {
      const messageAction = await messageActions.create({
        command: "audio",
        subcommand: "list",
        interactionId: interaction.id,
        currentPage: 0,
        query: "",
        buttons: [
          {
            type: "previousPage",
            label: "<<",
            buttonId: generateId(),
            style: "SECONDARY",
          },
          {
            type: "nextPage",
            label: ">>",
            buttonId: generateId(),
            style: "SECONDARY",
          },
        ],
      });

      const messageActionRow = buildMessageActionRow(messageAction.buttons);

      await interaction.reply({
        content: getPageOfClips(0).join("\n"),
        components: [messageActionRow],
        ephemeral: true,
      });
    },
  },
  handleButton: {
    set: async ({ interaction, messageAction }) => {
      if (
        messageAction.command !== "audio" ||
        messageAction.subcommand !== "upload"
      ) {
        return;
      }

      const author = interaction.member as GuildMember;
      let walkup = await walkups.get((w) => w.userId === author.id);
      if (!walkup) {
        await walkups.create({
          userId: author.id,
          clip: messageAction.clipName,
        });
      } else {
        walkup.clip = messageAction.clipName;
        await walkups.update(walkup);
      }

      await interaction.reply({
        content: `Walkup set to \`${messageAction.clipName}\`!`,
        ephemeral: true,
      });
    },
    previousPage: async ({ interaction, messageAction }) => {
      if (
        messageAction.command !== "audio" ||
        messageAction.subcommand !== "list"
      ) {
        return;
      }

      if (messageAction.currentPage === 0) {
        await interaction.deferUpdate();
        return;
      }

      messageAction.currentPage--;
      await interaction.update({
        content: getPageOfClips(messageAction.currentPage).join("\n"),
      });

      await messageActions.update(messageAction);
    },
    nextPage: async ({ interaction, messageAction }) => {
      if (
        messageAction.command !== "audio" ||
        messageAction.subcommand !== "list"
      ) {
        return;
      }

      if (messageAction.currentPage === getPages().length - 1) {
        await interaction.deferUpdate();
        return;
      }

      messageAction.currentPage++;

      await interaction.update({
        content: getPageOfClips(messageAction.currentPage).join("\n"),
      });

      await messageActions.update(messageAction);
    },
  },
};

export default Alive;
