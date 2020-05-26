import Command from '../structures/command';
import config from '../../config.json';
import fs from 'fs';

export default class AudioCommand extends Command {
  constructor(services) {
    super();
    this.audioService = services.audioService;
    this.details = {
      name: 'audio',
      description: 'Play specified audio clip',
      args: [
        {
          name: 'n',
          description: 'Name of audio clip',
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
    let clipName = args.n;
    let path = `${config.directories.audio}/${clipName}.mp3`;
    if (!fs.existsSync(path)) {
      return;
    }

    let channel;
    if (args.c) {
      channel = message.guild.channels.cache.find(channel => channel.name === args.c && channel.type === 'voice');
    } else {
      channel = message.member.voice.channel;
    }

    this.audioService.play(path, channel);
  }
}