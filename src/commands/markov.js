import Command from '../objects/command';

export default class MarkovCommand extends Command {
  constructor(container) {
    super();
    this.markovService = container.markovService;
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
    //TODO: rewrite this using own markov logic
  }
}