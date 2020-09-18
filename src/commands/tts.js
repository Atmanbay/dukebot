import Command from '../objects/command';
import googleTts from 'google-tts-api';
import joi from 'joi';

export default class AliveCommand extends Command {
  constructor(container) {
    super();
    this.audioService = container.audioService;
    this.loggerService = container.loggerService;
    let validator = container.validatorService;
    this.details = {
      name: 'tts',
      description: 'Join specified channel and say specified text',
      args: joi.object({
        text: joi
          .string()
          .required()
          .max(200)
          .note('Text to TTS'),

        speed: joi
          .number()
          .default(1)
          .note('Voice speed'),

        channel: joi
          .custom(validator.channel.bind(validator))
          .note('Name of voice channel to play in (defaults to user current channel')
      })
        .rename('t', 'text')
        .rename('s', 'speed')
        .rename('c', 'channel')
    };
  }

  async execute(message, args) {
    let channel;
    if (args.channel) {
      channel = args.channel;
    } else {
      channel = message.member.voice.channel;
    }

    try {
      let url = await googleTts(args.text, 'en', args.speed);
      this.audioService.play(url, channel); 
    } catch (error) {
      this.loggerService.error(`Error when attempting to do TTS in channel ${channel.name}`, error);
    }
  }
}