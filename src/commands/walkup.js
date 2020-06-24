import Command from '../objects/command';
import fs from 'fs';

export default class AudioCommand extends Command {
  constructor(container) {
    super();
    this.walkupService = container.walkupService;
    this.configService = container.configService;
    this.details = {
      name: 'walkup',
      description: 'Set a clip to play every time you enter a voice channel',
      args: [
        {
          name: 'n',
          description: 'Name of audio clip',
          optional: true
        },
        {
          name: 'delete',
          description: 'Flag to delete your walkup',
          optional: true
        }
      ]
    };
  }

  execute(message, args) {
    let userId = message.author.id;
    if (args.delete) {
      this.walkupService.removeWalkup(userId);
      message.react('👌');
      return;
    }

    let clipName = args.n;
    let path = `${this.configService.directories.audio}/${clipName}.mp3`;
    if (!fs.existsSync(path)) {
      return;
    }

    this.walkupService.saveWalkup({
      id: userId,
      clip: clipName
    });

    // Give user feedback that action was done
    message.react('👌');
  }
}