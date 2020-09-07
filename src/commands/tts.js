import Command from '../objects/command';
import googleTts from 'google-tts-api';

export default class AliveCommand extends Command {
  constructor(container) {
    super();
    this.audioService = container.audioService;
    this.loggerService = container.loggerService;
    this.details = {
      name: 'tts',
      description: 'Join specified channel and say specified text',
      args: [
        {
          name: 't',
          description: 'Text to TTS',
          optional: false
        },
        {
          name: 's',
          description: 'Voice speed',
          optional: true
        },
        {
          name: 'c',
          description: 'Name of voice channel to play in (defaults to users current channel)',
          optional: true
        }
      ]
    };
  }

  async execute(message, args) {
    if (!args.t) {
      return;
    }

    if (args.t.length > 200) {
      message.channel.send(`TTS text must be 200 characters or shorter. Your text is ${args.t.length} characters`);
      return;
    }

    let channel;
    if (args.c) {
      channel = message.guild.channels.cache.find(channel => channel.name === args.c && channel.type === 'voice');
    } else {
      channel = message.member.voice.channel;
    }

    let speed = 1;
    if (args.s) {
      speed = args.s;
    }

    try {
      let url = await googleTts(args.t, 'en', speed);
      this.audioService.play(url, channel); 
    } catch (error) {
      this.loggerService.error(`Error when attempting to do TTS in channel ${channel.name}`, error);
    } 
  }
}