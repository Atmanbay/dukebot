import Command from '../structures/command';
import Database from '../database';
import { isEmpty } from 'lodash';
import Markov from 'markov-strings';

export default new Command({
  name: 'markov',
  execute: function(msg, args) {
    let db = Database.get('messageHistory');
    let userId = '';
    if (args.u) {
      userId = args.u.user.id;
    } else {
      userId = msg.author.id;
    }

    let messageHistoryUser = db.find({ id: userId });
    if (isEmpty(messageHistoryUser.value())) {
      return;
    }

    let messages = messageHistoryUser.value().messages;
    let markov = new Markov(messages, {stateSize: 2});
    markov.buildCorpus();

    let options = {
      maxTries: 100,
      prng: Math.random,
      filter: (result) => {
        return true;
      }
    }

    msg.channel.send(markov.generate(options).string);
  }
});