import Command from '../objects/command';
import fs from 'fs';
import joi from 'joi';

export default class AudioCommand extends Command {
  constructor(container) {
    super();
    this.walkupService = container.walkupService;
    this.configService = container.configService;
    this.details = {
      name: 'walkup',
      description: 'Set a clip to play every time you enter a voice channel',
      args: joi.object({
        name: joi
          .string()
          .note('Name of audio clip'),

        delete: joi
          .boolean()
          .note('Flag to delete your walkup')
      })
        .xor('name', 'delete')
        .rename('n', 'name')
        .rename('d', 'delete')
    };
  }

  execute(message, args) {
    let userId = message.author.id;
    if (args.delete) {
      this.walkupService.removeWalkup(userId);
      message.react('🗑️');
      return;
    }

    let clipName = args.name;
    let path = `${this.configService.paths.audio}/${clipName}.mp3`;
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