import Command from "../objects/command";

export default class AvatarCommand extends Command {
  constructor(container) {
    super();
    this.botUserService = container.botUserService;
    this.details = {
      name: 'avatar',
      description: 'Change the bot\'s avatar',
      args: [
        {
          name: 'a',
          description: 'URL of the new avatar picture',
          optional: false
        }
      ]
    };
  }
  
  execute(message, args) {
    if (!args.u) {
      return;
    }

    let botUser = this.botUserService.getBotUser();
    botUser.setAvatar(args.u);
  }
}