import Command from '../objects/command';

export default class BanCommand extends Command {
  constructor(container) {
    super();
    this.banService = container.banService;
    this.details = {
      name: 'ban',
      description: 'Prevent a user from interacting with the bot for a while',
      args: [
        {
          name: 'u',
          description: 'User to ban',
          optional: false
        }
      ]
    };
  }

  async execute(message, args) {
    if (args.u) {
      message.channel.send('User has been banned');
      await this.banService.banUser(args.u.user.id).then(() => {
        message.channel.send('User has been unbanned');
      })
    }
  }
}