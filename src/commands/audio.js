import Command from '../objects/command';
import fs from 'fs';
import download from 'download';
import sanitize from 'sanitize-filename';

export default class AudioCommand extends Command {
  constructor(container) {
    super();
    this.audioService = container.audioService;
    this.configService = container.configService;
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
        },
        {
          name: 'list',
          description: 'Flag to list all audio clips',
          optional: true
        },
        {
          name: 'upload',
          description: 'Flag to start the audio clip upload process',
          optional: true
        }
      ]
    };
  }

  execute(message, args) {
    if (args.list) {
      let clips = this.audioService.getClips();
      clips.unshift('```');
      clips.push('```');
      message.channel.send(clips);
      return;
    }

    if (args.upload) {
      message.channel.send('Please upload your file!').then(() => {
        let filter = m => message.author.id === m.author.id;
        message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
          .then(messages => {
            let message = messages.first();
            let attachments = message.attachments;
            if (attachments && attachments.size === 1) {
              let url = attachments.first().url;
              let options = {};
              if (message.content) {
                options.filename = `${sanitize(message.content)}.mp3`;
              }
              download(url, this.configService.directories.audio, options);
            }
          })
          .catch(() => {
            message.channel.send('You took too long!');
          });
      });
      return;
    }

    let clipName = args.n;
    let path = `${this.configService.directories.audio}/${clipName}.mp3`;
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