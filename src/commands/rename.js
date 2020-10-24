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
        text: joi
          .string()
          .required()
          .note('New name for the bot')
      })
        .rename('t', 'text')
    };
  }
  
  async execute(message, args) {
    let botUserId = this.botUserService.getBotUser().id;
    let guildUser = await message.guild.members.fetch(botUserId);

    guildUser.setNickname(args.n)
  }
}