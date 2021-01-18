import * as googleTTS from "google-tts-api";
import joi from "joi";

export default class {
  constructor(services) {
    this.audioService = services.audio;
    this.loggingService = services.logging;
    this.validatorService = services.validator;
  }

  get details() {
    return {
      description: "Join specified channel and say specified text",
      args: joi
        .object({
          text: joi.string().required().max(200).note("Text to TTS"),

          slow: joi
            .boolean()
            .default(false)
            .note("Boolean flag to make TTS slow"),

          channel: joi
            .custom(this.validatorService.channel.bind(this.validatorService))
            .note(
              "Name of voice channel to play in (defaults to user current channel"
            ),
        })
        .rename("t", "text")
        .rename("s", "slow")
        .rename("c", "channel"),
    };
  }

  async execute({ message, args }) {
    let channel = args.channel ? args.channel : message.member.voice.channel;
    if (!channel) {
      return;
    }

    try {
      let url = await googleTTS.getAudioUrl(args.text, {
        lang: "en-US",
        slow: args.slow,
        host: "https://translate.google.com",
      });
      this.audioService.play(url, channel);
    } catch (error) {
      this.loggingService.error(
        `Error when attempting to do TTS in channel ${channel.name}`,
        error
      );
    }
  }
}
