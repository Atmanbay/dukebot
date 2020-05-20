import Command from '../structures/command';
import { isEmpty } from 'lodash';
import Markov from 'markov-strings';

export default new Command({
  details: {
    name: 'markov',
    description: 'Creates a new message using a markov chain based on users previous messages',
    args: [
      {
        name: 'u',
        description: 'User to impersonate (defaults to user)',
        optional: true
      }
    ]
  },
  execute: function(message, args, database) {
    let db = database.get('messages');
    let userId = '';
    if (args.u) {
      userId = args.u.user.id;
    } else {
      userId = message.author.id;
    }

    let messageHistoryUser = db.find({ id: userId });
    if (isEmpty(messageHistoryUser.value())) {
      return;
    }

    let messages = messageHistoryUser.value().messages;
    let markov = new Markov(messages, {stateSize: 2});
    markov.buildCorpus();

    let options = {
      maxTries: 10,
      prng: Math.random
    }

    message.channel.send(markov.generate(options).string);
  }
});