import { isEmpty } from 'lodash';
import Command from '../objects/command';
import joi from 'joi';

export default class MarkovCommand extends Command {
  constructor(container) {
    super();
    this.markovService = container.markovService;
    this.guildService = container.guildService;
    this.loggerService = container.loggerService;
    this.messageHistoryService = container.messageHistoryService;
    let validator = container.validatorService;
    this.details = {
      name: 'markov',
      description: 'Creates a new message using a markov chain based on users previous messages',
      args: joi.object({
        user: joi
          .custom(validator.user.bind(validator))
          .note('Target user to markov (defaults to message author)'),

        variance: joi
          .number()
          .min(1)
          .max(10)
          .default(1)
          .note('Forces markov generation to use more than this number of messages'),

        chunkSize: joi
          .number()
          .min(1)
          .max(10)
          .default(2)
          .note('Set the size (in words) of each chunk. Default is 2'),

        maxTries: joi
          .number()
          .min(10)
          .max(500)
          .default(200)
          .note('Set the number of max tries before it gives up. Default is 200')
      })
        .rename('u', 'user')
        .rename('v', 'variance')
        .rename('c', 'chunkSize')
        .rename('m', 'maxTries')
    };
  }

  async execute(message, args) {
    message.react('⌛'); // Reacting to message immediately so user knows we're working on it

    let user = args.user ? args.user : message.author;
    let messages = this.messageHistoryService.fetchMessages(user.id);
    if (isEmpty(messages)) {
      return;
    }

    message.channel.send(this.markovService.buildMarkov({
      messages: messages,
      stateSize: args.chunkSize,
      maxTries: args.maxTries,
      variance: args.variance
    }));
  }
}