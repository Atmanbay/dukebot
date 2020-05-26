import Command from '../structures/command';
import { isEmpty } from 'lodash';
import Markov from 'markov-strings';

export default class MarkovCommand extends Command {
  constructor(services) {
    super();
    this.markovService = services.markovService;
    this.details = {
      name: 'markov',
      description: 'Creates a new message using a markov chain based on users previous messages',
      args: [
        {
          name: 'u',
          description: 'User to impersonate (defaults to user)',
          optional: true
        }
      ]
    };
  }

  execute(message, args) {
    let userId = '';
    if (args.u) {
      userId = args.u.user.id;
    } else {
      userId = message.author.id;
    }

    this.markovService.buildMarkov(userId).then((result) => {
      message.channel.send(result);
    })
  }
}