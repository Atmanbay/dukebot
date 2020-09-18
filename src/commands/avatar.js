import Command from "../objects/command";
import joi from 'joi';

export default class AvatarCommand extends Command {
  constructor(container) {
    super();
    this.botUserService = container.botUserService;
    this.details = {
      name: 'avatar',
      description: 'Change the bot\'s avatar',
      args: joi.object({
        url: joi
          .string()
          .required()
          .note('URL of image')
      })
      .rename('u', 'url')
    };
  }
  
  execute(message, args) {
    let botUser = this.botUserService.getBotUser();
    botUser.setAvatar(args.url);
  }
}