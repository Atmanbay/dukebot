const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = class {
  constructor(services) {
    this.audioService = services.audio;
    this.ttsService = services.tts;
  }

  get getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("tts")
      .setDescription(
        "Use Google's TTS service to play text-to-speech in a voice channel"
      )
      .addStringOption((option) =>
        option
          .setName("text")
          .setDescription("Text to synthesize")
          .setRequired(true)
      )
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("Channel to play the TTS in")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("language")
          .setDescription(
            "Language code to synthesize text in (defaults to `en`)"
          )
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("slow")
          .setDescription("Boolean flag for slow speech (defaults to `false`)")
          .setRequired(false)
      );
  }

  async execute(interaction) {
    let text = interaction.options.getString("text");
    let channel = interaction.options.getChannel("channel");
    let lang = interaction.options.getString("language") ?? "en";
    let slow = interaction.options.getBoolean("slow") ?? false;

    let audioChannel = channel ?? interaction.member.voice.channel;
    if (!audioChannel) {
      interaction.reply({
        content: `Must either be in a voice channel or specify voice channel`,
        ephemeral: true,
      });
      return;
    }

    let url = this.ttsService.getAudioUrl({ text, lang, slow });

    interaction.reply({
      content: `Playing synthesized text!`,
      ephemeral: true,
    });

    await this.audioService.play(audioChannel, url);
  }
};
