import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  GuildMember,
  VoiceChannel,
} from "discord.js";
import { existsSync } from "fs";
import { play } from "../../../../../../utils/audio.js";
import config from "../../../../../../utils/config.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "play",
  description: "Play a clip in the designated audio channel",
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
    },
  ],
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
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
