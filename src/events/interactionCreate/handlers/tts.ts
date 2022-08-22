import { GuildMember, VoiceChannel } from "discord.js";
import googleTTS from "google-tts-api";
import { play } from "../../../utils/audio.js";
import { InteractionCreateHandler } from "../index.js";

const TTSInteractionCreateHandler: InteractionCreateHandler = {
  name: "tts",
  description: "Interact with the Google TTS API",
  options: [
    {
      type: "STRING",
      name: "text",
      description: "The text to TTS in an audio channel",
      required: true,
    },
    {
      type: "CHANNEL",
      name: "channel",
      description:
        "The audio channel to play the TTS in (defaults to caller's current channel)",
      required: false,
    },
    {
      type: "STRING",
      name: "language",
      description: "The language code (defaults to `en-US`)",
      required: false,
    },
    {
      type: "BOOLEAN",
      name: "slow",
      description:
        "Boolean flag to determine if TTS should be slowed down (defaults to false)",
      required: false,
    },
  ],
  handle: async (interaction) => {
    const text = interaction.options.getString("text");
    const lang = interaction.options.getString("language") ?? "en-US";
    const slow = interaction.options.getBoolean("slow") ?? false;

    let channel = interaction.options.getChannel("channel") as VoiceChannel;
    if (!channel) {
      channel = (interaction.member as GuildMember).voice
        .channel as VoiceChannel;
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
  },
};

export default TTSInteractionCreateHandler;
