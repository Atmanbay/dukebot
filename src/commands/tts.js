import Command from '../objects/command';
import googleTts from 'google-tts-api';

export default class AliveCommand extends Command {
  constructor(container) {
    super();
    this.audioService = container.audioService;
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
          name: 'c',
          description: 'Name of voice channel to play in (defaults to users current channel)',
          optional: true
        }
      ]
    };
  }

  execute(message, args) {
    if (!args.t) {
      return;
    }

    let channel;
    if (args.c) {
      channel = message.guild.channels.cache.find(channel => channel.name === args.c && channel.type === 'voice');
    } else {
      channel = message.member.voice.channel;
    }

    let audioService = this.audioService;
    googleTts(args.t, 'en', 1)
      .then((url) => {
        audioService.play(url, channel);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}