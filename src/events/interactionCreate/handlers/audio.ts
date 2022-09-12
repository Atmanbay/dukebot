import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { GuildMember, VoiceChannel } from "discord.js";
import download from "download";
import { existsSync, readdirSync } from "fs";
import sanitize from "sanitize-filename";
import { messageActions, walkups } from "../../../database/database.js";
import { Button } from "../../../database/models.js";
import config from "../../../utils/config.js";
import {
  buildMessageActionRow,
  buildTable,
  generateId,
} from "../../../utils/general.js";
import { InteractionCreateHandler } from "../index.js";

const player = createAudioPlayer({
  behaviors: { noSubscriber: NoSubscriberBehavior.Play },
});

const disconnect = async (connection: VoiceConnection) => {
  if (
    connection &&
    connection.state.status !== VoiceConnectionStatus.Destroyed
  ) {
    connection.destroy();
  }
};

const play = async (channel: VoiceChannel, path: string) => {
  let connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    debug: true,
    selfDeaf: false,
  });

  connection.on(VoiceConnectionStatus.Ready, () => {
    let resource = createAudioResource(path);
    player.play(resource);
    player.on(AudioPlayerStatus.Idle, () => disconnect(connection));
    player.on("error", () => disconnect(connection));
    connection.subscribe(player);
  });

  await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
};

const getClips = () => {
  let files: string[] = [];
  readdirSync(config.paths.audio).forEach((file) => {
    files.push(file.replace(".mp3", ""));
  });

  files.sort();
  return files;
};

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
  let page = [...pages[pageNumber]];
  let buffer = 5;
  let columnWidth = Math.max(...page.map((c) => c.length)) + buffer;
  let halfway = Math.ceil(page.length / 2);
  let leftColumn = page.splice(0, halfway);

  let rows: [string, string][] = [];
  for (let i = 0; i < halfway; i++) {
    let row: [string, string] = [leftColumn.shift(), page.shift()];
    rows.push(row);
  }

  let table = buildTable({
    leftColumnWidth: columnWidth,
    rightColumnWidth: columnWidth,
    rows: rows,
  });
  table.unshift("```");
  table.push("```");
  return table;
};

const AudioInteractionCreateHandler: InteractionCreateHandler = {
  name: "audio",
  description: "Play, upload, or list audio clips",
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
    {
      type: "SUB_COMMAND_GROUP",
      name: "walkup",
      description: "Set or clear your walkup",
      options: [
        {
          type: "SUB_COMMAND",
          name: "set",
          description: "Set your walkup",
          options: [
            {
              type: "STRING",
              name: "name",
              description: "Name of clip to set as your walkup",
              required: true,
            },
          ],
        },
        {
          type: "SUB_COMMAND",
          name: "clear",
          description: "Clear your walkup",
        },
      ],
    },
  ],
  handle: {
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
        ephemeral: true,
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

            const buttons: Button[] = [
              {
                type: "set",
                label: "Set as Walkup",
                buttonId: generateId(),
                style: "PRIMARY",
              },
            ];

            const messageActionRow = buildMessageActionRow(buttons);

            await interaction.reply({
              content: `Successfully uploaded ${rawFileName}`,
              components: [messageActionRow],
              ephemeral: true,
            });

            let message = await interaction.fetchReply();
            await messageActions.create({
              messageId: message.id,
              data: {
                command: "audio",
                subcommand: "upload",
                clipName: sanitized,
              },
              buttons,
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
      const buttons: Button[] = [
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
      ];

      const messageActionRow = buildMessageActionRow(buttons);

      await interaction.reply({
        content: getPageOfClips(0).join("\n"),
        components: [messageActionRow],
        ephemeral: true,
      });

      let message = await interaction.fetchReply();
      await messageActions.create({
        messageId: message.id,
        data: {
          command: "audio",
          subcommand: "list",
          currentPage: 0,
        },
        buttons,
      });
    },
    set: async (interaction) => {
      let clipName = interaction.options.getString("name");

      let walkup = walkups.get(
        (walkup) => walkup.userId === interaction.member.user.id
      );
      if (walkup) {
        walkup.clip = clipName;
        await walkups.update(walkup);
      } else {
        await walkups.create({
          userId: interaction.member.user.id,
          clip: clipName,
        });
      }

      await interaction.reply({
        content: `Walkup set to \`${clipName}\`!`,
        ephemeral: true,
      });
    },
    clear: async (interaction) => {
      let walkup = walkups.get(
        (walkup) => walkup.userId === interaction.member.user.id
      );
      if (walkup) {
        await walkups.delete(walkup.id);
      }

      await interaction.reply({
        content: `Walkup cleared!`,
        ephemeral: true,
      });
    },
  },
  handleButton: {
    set: async ({ interaction, messageAction }) => {
      if (messageAction.data.subcommand !== "upload") {
        return;
      }

      const author = interaction.member as GuildMember;
      let walkup = walkups.get((w) => w.userId === author.id);
      if (!walkup) {
        await walkups.create({
          userId: author.id,
          clip: messageAction.data.clipName,
        });
      } else {
        walkup.clip = messageAction.data.clipName;
        await walkups.update(walkup);
      }

      await interaction.reply({
        content: `Walkup set to \`${messageAction.data.clipName}\`!`,
        ephemeral: true,
      });
    },
    previousPage: async ({ interaction, messageAction }) => {
      if (messageAction.data.subcommand !== "list") {
        return;
      }
      if (messageAction.data.currentPage === 0) {
        await interaction.deferUpdate();
        return;
      }

      messageAction.data.currentPage--;
      await interaction.update({
        content: getPageOfClips(messageAction.data.currentPage).join("\n"),
      });

      await messageActions.update(messageAction);
    },
    nextPage: async ({ interaction, messageAction }) => {
      if (messageAction.data.subcommand !== "list") {
        return;
      }

      if (messageAction.data.currentPage === getPages().length - 1) {
        await interaction.deferUpdate();
        return;
      }

      messageAction.data.currentPage++;

      await interaction.update({
        content: getPageOfClips(messageAction.data.currentPage).join("\n"),
      });

      await messageActions.update(messageAction);
    },
  },
};

export default AudioInteractionCreateHandler;
