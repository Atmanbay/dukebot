import Command from '../structures/command';

export default new Command({
  name: 'alive',
  execute: function(msg, args) {
    msg.channel.send("I'm alive!");
  }
});