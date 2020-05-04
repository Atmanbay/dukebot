import Command from '../structures/command';

export default new Command({
  details: {
    name: 'alive',
    description: 'Check if the bot is alive',
  },
  execute: function(message) {
    message.channel.send("I'm alive!");
  }
});