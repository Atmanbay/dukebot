import Command from "../objects/command";

export default class RenameCommand extends Command {
  constructor(container) {
    super();
    this.botUserService = container.botUserService;
    this.details = {
      name: 'rename',
      description: 'Rename the bot',
      args: [
        {
          name: 'n',
          description: 'New name of the bot',
          optional: false
        }
      ]
    };
  }
  
  execute(message, args) {
    if (!args.n) {
      return;
    }

    let botUserId = this.botUserService.getBotUser().id;
    message.guild.members
      .fetch(botUserId)
      .then((guildUser) => {
        guildUser.setNickname(args.n)
      });
  }
}