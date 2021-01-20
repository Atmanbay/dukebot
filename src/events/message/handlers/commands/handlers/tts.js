import joi from "joi";

export default class {
  constructor(services) {
    this.audioService = services.audio;
    this.loggingService = services.logging;
    this.ttsService = services.tts;
    this.validatorService = services.validator;
  }

  get details() {
    return {
      description: "Join specified channel and say specified text",
      args: joi
        .object({
          text: joi.string().max(200).note("Text to TTS"),

          list: joi.boolean().note("Boolean flag to list character choices"),

          voice: joi.string().note("Character voice to use"),

          channel: joi
            .custom(this.validatorService.channel.bind(this.validatorService))
            .note(
              "Name of voice channel to play in (defaults to user current channel"
            ),
        })
        .xor("text", "list")
        .rename("t", "text")
        .rename("l", "list")
        .rename("v", "voice")
        .rename("c", "channel"),
    };
  }

  async execute({ message, args }) {
    if (args.list) {
      let characters = this.ttsService.list();
      message.channel.send(characters);
      return;
    }

    if (!this.ttsService.voiceExists(args.voice)) {
      message.channel.send(`No character voice was found for ${args.voice}`);
      return;
    }

    let channel = args.channel ? args.channel : message.member.voice.channel;
    if (!channel) {
      return;
    }

    message.react("⌛");
    this.ttsService.play(args.voice, args.text, channel);
  }
}
