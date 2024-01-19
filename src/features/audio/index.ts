import {
  ActionRowBuilder,
  AnySelectMenuInteraction,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  GuildMember,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  VoiceChannel,
  VoiceState,
} from "discord.js";
import download from "download";
import { existsSync, readdirSync } from "fs";
import sanitize from "sanitize-filename";
import { Feature } from "..";
import { getSingletonTable } from "../../database/database.js";
import { BaseDatabaseObject } from "../../database/models.js";
import { play } from "../../utils/audio.js";
import config from "../../utils/config.js";
import { toTable } from "../../utils/format.js";
import { logError, logInfo } from "../../utils/logger.js";

type Walkup = BaseDatabaseObject & {
  userId: string;
  clipName: string;
};

type InteractionContext = BaseDatabaseObject & {
  interactionId: string;
  context: any;
};

const walkups = await getSingletonTable<Walkup>("walkups");
const interactionContexts = await getSingletonTable<InteractionContext>(
  "interactionContexts"
);

// storing this in memory since it doesn't really matter
const selectedClipByUser: { [userId: string]: string } = {};

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

const getPage = (pageNumber: number) => {
  let pages = getPages();
  let page = [...pages[pageNumber]];
  let buffer = 5;
  let halfway = Math.ceil(page.length / 2);
  let leftColumn = page.splice(0, halfway);

  let rows: [string, string][] = [];
  for (let i = 0; i < halfway; i++) {
    let row: [string, string] = [leftColumn.shift(), page.shift()];
    rows.push(row);
  }

  return toTable(rows, buffer);
};

const goToPage = async (
  interaction: ButtonInteraction,
  context: InteractionContext,
  pageNumber: number
) => {
  if (pageNumber >= context.context.pages.length) {
    pageNumber = context.context.pages.length - 1;
  } else if (pageNumber < 0) {
    pageNumber = 0;
  }

  context.context.position = pageNumber;

  let payload = getListMessagePayload(pageNumber);

  await interaction.update(payload);
  await interactionContexts.update(context);
};

const audioClipSelect = async (interaction: AnySelectMenuInteraction) => {
  const guildMember = interaction.member as GuildMember;
  let clipName = interaction.values[0];
  selectedClipByUser[guildMember.user.id] = clipName;

  await interaction.reply({
    content: `Selected ${clipName}, now click Play or Set As Walkup`,
    ephemeral: true,
  });
};

const playHandler = async (interaction: ChatInputCommandInteraction) => {
  const clipName = interaction.options.getString("name");
  let channel = interaction.options.getChannel("channel") as VoiceChannel;
  if (!channel) {
    channel = (interaction.member as GuildMember).voice.channel as VoiceChannel;
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
};

const getListMessagePayload = (pageNumber: number) => {
  let buttonData = [
    {
      id: "firstPage",
      label: "<<",
    },
    {
      id: "previousPage",
      label: "<",
    },
    {
      id: "nextPage",
      label: ">",
    },
    {
      id: "lastPage",
      label: ">>",
    },
  ];

  let buttons = buttonData.map((bd) =>
    new ButtonBuilder()
      .setCustomId(bd.id)
      .setLabel(bd.label)
      .setStyle(ButtonStyle.Primary)
  );

  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    buttons
  );

  let pages = getPages();
  let page = [...pages[pageNumber]];

  const selector = new StringSelectMenuBuilder()
    .setCustomId("audioClipSelect")
    .setPlaceholder("Select a clip")
    .setOptions(
      page.map((c) => {
        return new StringSelectMenuOptionBuilder().setLabel(c).setValue(c);
      })
    );

  const selectorRow =
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector);

  const playButton = new ButtonBuilder()
    .setCustomId("play")
    .setLabel("Play")
    .setStyle(ButtonStyle.Secondary);

  const setAsWalkupButton = new ButtonBuilder()
    .setCustomId("setWalkup")
    .setLabel("Set As Walkup")
    .setStyle(ButtonStyle.Secondary);

  const selectorButtons = new ActionRowBuilder<ButtonBuilder>().addComponents([
    playButton,
    setAsWalkupButton,
  ]);

  return {
    content: getPage(pageNumber),
    components: [buttonRow, selectorRow, selectorButtons],
    ephemeral: true,
  };
};

const listHandler = async (interaction: ChatInputCommandInteraction) => {
  await interactionContexts.create({
    interactionId: interaction.id,
    context: {
      position: 0,
      pages: getPages(),
    },
  });

  const payload = getListMessagePayload(0);
  await interaction.reply(payload);
};

const uploadHandler = async (interaction: ChatInputCommandInteraction) => {
  const name = interaction.options.getString("name");
  const clip = interaction.options.getAttachment("clip");

  let url = clip.url;
  let sanitizedName = sanitize(name);

  let options = {
    filename: `${sanitizedName}.mp3`,
  };

  await download(url, config.paths.audio, options);

  const button = new ButtonBuilder()
    .setCustomId("setWalkup")
    .setLabel("Set as Walkup")
    .setStyle(ButtonStyle.Primary);

  await interactionContexts.create({
    interactionId: interaction.id,
    context: {
      clipName: sanitizedName,
    },
  });

  const actionRowBuilder = new ActionRowBuilder<ButtonBuilder>().addComponents(
    button
  );

  await interaction.reply({
    content: `Successfully uploaded ${sanitizedName}`,
    components: [actionRowBuilder],
    ephemeral: true,
  });
};

const walkupSetHandler = async (interaction: ChatInputCommandInteraction) => {
  let clipName = interaction.options.getString("name");

  let path = `${config.paths.audio}/${clipName}.mp3`;
  if (!existsSync(path)) {
    await interaction.reply({
      content: `Clip named ${clipName} not found`,
      ephemeral: true,
    });
    return;
  }

  let walkup = walkups.get(
    (walkup) => walkup.userId === interaction.member.user.id
  );

  if (walkup) {
    walkup.clipName = clipName;
    await walkups.update(walkup);
  } else {
    await walkups.create({
      userId: interaction.member.user.id,
      clipName: clipName,
    });
  }

  await interaction.reply({
    content: `Walkup set to \`${clipName}\`!`,
    ephemeral: true,
  });
};

const walkupClearHandler = async (interaction: ChatInputCommandInteraction) => {
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
};

const setWalkup = async (
  interaction: ButtonInteraction,
  context: InteractionContext
) => {
  const guildMember = interaction.member as GuildMember;
  let walkup = walkups.get((w) => w.userId === guildMember.user.id);
  let clipName =
    context?.context?.clipName ?? selectedClipByUser[guildMember.user.id];

  if (!walkup) {
    await walkups.create({
      userId: guildMember.user.id,
      clipName: clipName,
    });
  } else {
    walkup.clipName = clipName;
    await walkups.update(walkup);
  }

  await interaction.reply({
    content: `Walkup set to \`${clipName}\`!`,
    ephemeral: true,
  });
};

const playButtonHandler = async (interaction: ButtonInteraction) => {
  const guildMember = interaction.member as GuildMember;
  let clipName = selectedClipByUser[guildMember.user.id];
  let channel = guildMember.voice.channel as VoiceChannel;
  if (!channel) {
    await interaction.reply({
      content: "You must be in a voice channel to use this",
      ephemeral: true,
    });
    return;
  }

  let path = `${config.paths.audio}/${clipName}.mp3`;

  await interaction.reply({
    content: `Playing \`${clipName}\` in \`${channel.name}\``,
    ephemeral: true,
  });

  await play(channel, path);
};

const walkupHandler = async (oldState: VoiceState, newState: VoiceState) => {
  try {
    // channelId will be blank if oldState->newState is leaving a voice channel
    if (!newState.channelId) {
      return;
    }

    // if going from voice channel to voice channel then don't play
    if (oldState.channelId && newState.channelId) {
      return;
    }

    // channelIds will equal each other if user just deafened/muted self
    if (oldState.channelId === newState.channelId) {
      return;
    }

    // don't play walkup if user is deafened or muted
    if (newState.selfDeaf || newState.selfMute) {
      return;
    }

    let walkup = walkups.get(
      (walkup) => walkup.userId === newState.member.user.id
    );
    if (!walkup) {
      return;
    }

    let path = `${config.paths.audio}/${walkup.clipName}.mp3`;
    if (!existsSync(path)) {
      logInfo(
        `Tried to play walkup ${walkup.clipName} but file does not exist`
      );
      return;
    }

    await play(newState.channel as VoiceChannel, path);
  } catch (error) {
    logError(error);
  }
};

const audio: Feature = {
  load: async (loaders) => {
    loaders.commands.load({
      type: ApplicationCommandType.ChatInput,
      name: "audio",
      description: "Play, upload, or list audio clips",
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "list",
          description: "List all audio clips",
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "play",
          description: "Play a specified clip",
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: "name",
              description: "Name of clip to play",
              required: true,
            },
            {
              type: ApplicationCommandOptionType.Channel,
              name: "channel",
              description:
                "Audio channel to play the clip in (defaults to caller's current channel)",
              required: false,
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "upload",
          description: "Upload a clip",
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: "name",
              description: "Name to give clip",
              required: true,
            },
            {
              type: ApplicationCommandOptionType.Attachment,
              name: "clip",
              description: "The .mp3 file to upload",
              required: true,
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.SubcommandGroup,
          name: "walkup",
          description: "Set or clear your walkup",
          options: [
            {
              type: ApplicationCommandOptionType.Subcommand,
              name: "set",
              description: "Set your walkup",
              options: [
                {
                  type: ApplicationCommandOptionType.String,
                  name: "name",
                  description: "The name of the clip to set as your walkup",
                  required: true,
                },
              ],
            },
            {
              type: ApplicationCommandOptionType.Subcommand,
              name: "clear",
              description: "Clear your walkup",
            },
          ],
        },
      ],
    });

    loaders.chatInput.load({
      commandTree: ["audio", "list"],
      handler: listHandler,
    });
    loaders.chatInput.load({
      commandTree: ["audio", "play"],
      handler: playHandler,
    });
    loaders.chatInput.load({
      commandTree: ["audio", "upload"],
      handler: uploadHandler,
    });
    loaders.chatInput.load({
      commandTree: ["audio", "walkup", "set"],
      handler: walkupSetHandler,
    });
    loaders.chatInput.load({
      commandTree: ["audio", "walkup", "clear"],
      handler: walkupClearHandler,
    });

    loaders.buttons.load({ id: "setWalkup", handler: setWalkup });
    loaders.buttons.load({ id: "play", handler: playButtonHandler });
    loaders.buttons.load({
      id: "firstPage",
      handler: async (interaction, context) =>
        goToPage(interaction, context, 0),
    });
    loaders.buttons.load({
      id: "lastPage",
      handler: async (interaction, context) =>
        goToPage(interaction, context, context.context.pages.length - 1),
    });
    loaders.buttons.load({
      id: "nextPage",
      handler: async (interaction, context) =>
        goToPage(interaction, context, context.context.position + 1),
    });
    loaders.buttons.load({
      id: "previousPage",
      handler: async (interaction, context) =>
        goToPage(interaction, context, context.context.position - 1),
    });

    loaders.selectMenus.load({
      id: "audioClipSelect",
      handler: audioClipSelect,
    });

    loaders.voice.load(walkupHandler);
  },
};

export default audio;
