import Command from "../objects/command";
import joi from 'joi';

export default class RenameCommand extends Command {
  constructor(container) {
    super();
    this.botUserService = container.botUserService;
    this.details = {
      name: 'rename',
      description: 'Rename the bot',
      args: joi.object({
        name: joi
          .string()
          .required()
          .note('New name for the bot')
      })
        .rename('n', 'name')
    };
  }
  
  async execute(message, args) {
    if (!args.n) {
      return;
    }

    let botUserId = this.botUserService.getBotUser().id;
    let guildUser = await message.guild.members.fetch(botUserId);

    guildUser.setNickname(args.n)
  }
}