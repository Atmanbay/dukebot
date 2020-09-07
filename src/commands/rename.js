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
  
  async execute(message, args) {
    if (!args.n) {
      return;
    }

    let botUserId = this.botUserService.getBotUser().id;
    let guildUser = await message.guild.members.fetch(botUserId);

    guildUser.setNickname(args.n)
  }
}