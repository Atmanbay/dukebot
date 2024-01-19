import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  GuildMember,
  VoiceChannel,
} from "discord.js";
import googleTTS from "google-tts-api";
import { Feature } from "..";
import { play } from "../../utils/audio.js";

const handler = async (interaction: ChatInputCommandInteraction) => {
  const text = interaction.options.getString("text");
  const lang = interaction.options.getString("language") ?? "en-US";
  const slow = interaction.options.getBoolean("slow") ?? false;

  let channel = interaction.options.getChannel("channel") as VoiceChannel;
  if (!channel) {
    channel = (interaction.member as GuildMember).voice.channel as VoiceChannel;
  }

  if (!channel) {
    interaction.reply({
      content: `Must either be in a voice channel or specify voice channel`,
      ephemeral: true,
    });
    return;
  }

  let url = googleTTS.getAudioUrl(text, {
    lang,
    slow,
  });

  await interaction.reply({
    content: `Playing TTS'ed text in ${channel.name}`,
    ephemeral: true,
  });

  await play(channel, url);
};

const emoji: Feature = {
  load: async (loaders) => {
    loaders.commands.load({
      type: ApplicationCommandType.ChatInput,
      name: "tts",
      description: "Interact with the Google TTS API",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "text",
          description: "The text to TTS in an audio channel",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.Channel,
          name: "channel",
          description:
            "The audio channel to play the TTS in (defaults to caller's current channel)",
          required: false,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "language",
          description: "The language code (defaults to `en-US`)",
          required: false,
        },
        {
          type: ApplicationCommandOptionType.Boolean,
          name: "slow",
          description:
            "Boolean flag to determine if TTS should be slowed down (defaults to false)",
          required: false,
        },
      ],
    });

    loaders.chatInput.load({ commandTree: ["tts"], handler });
  },
};

export default emoji;
