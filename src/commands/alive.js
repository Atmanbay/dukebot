import Command from '../structures/command';

export default class AliveCommand extends Command {
  constructor() {
    super();
    this.details = {
      name: 'alive',
      description: 'Check if the bot is alive',
    };
  }

  execute(message) {
    message.channel.send("I'm alive!");
  }
}