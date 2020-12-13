import googleTts from "google-tts-api";
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

          speed: joi.number().default(1).note("Voice speed"),

          channel: joi
            .custom(this.validatorService.channel.bind(this.validatorService))
            .note(
              "Name of voice channel to play in (defaults to user current channel"
            ),
        })
        .rename("t", "text")
        .rename("s", "speed")
        .rename("c", "channel"),
    };
  }

  async execute({ message, args }) {
    let channel = args.channel ? args.channel : message.member.voice.channel;
    if (!channel) {
      return;
    }

    try {
      let url = await googleTts(args.text, "en", args.speed);
      this.audioService.play(url, channel);
    } catch (error) {
      this.loggingService.error(
        `Error when attempting to do TTS in channel ${channel.name}`,
        error
      );
    }
  }
}
