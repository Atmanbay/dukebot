import Trigger from '../structures/trigger';

export default new Trigger({
  details: {
    description: 'Trigger test',
  },
  isMatch: function(message) {
    return message.content.toLowerCase().includes('testing 123');
  },
  execute: function(message, database) {
    message.channel.send('456');
  }
});