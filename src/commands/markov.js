import Command from '../objects/command';
import joi from 'joi';

export default class MarkovCommand extends Command {
  constructor(container) {
    super();
    this.markovService = container.markovService;
    this.guildService = container.guildService;
    this.loggerService = container.loggerService;
    this.commandPrefix = container.configService.prefix;
    let validator = container.validatorService;
    this.details = {
      name: 'markov',
      description: 'Creates a new message using a markov chain based on users previous messages',
      args: joi.object({
        user: joi
          .custom(validator.user.bind(validator))
          .note('Target user to markov (defaults to message author)'),

        channel: joi
          .custom(validator.channel.bind(validator))
          .note('Channel to get messages from (defaults to all channels)'),

        variance: joi
          .number()
          .min(1)
          .max(10)
          .default(1)
          .note('Forces markov generation to use more than this number of messages')
      })
        .rename('u', 'user')
        .rename('c', 'channel')
        .rename('v', 'variance')
    };
  }

  async execute(message, args) {
    let user = args.user ? args.user : message.author;
    let channel = args.channel;

    let channels = [];
    if (channel) {
      channels.push(channel);
    } else {
      channels = this.guildService.getChannels('text');
    }

    let messages = [];
    await Promise.all(channels.map(async (channel) => {
      return channel.messages
        .fetch()
        .then(messages => messages.filter(m => m.author.id === user.id && !m.content.startsWith(this.commandPrefix) && !m.content.startsWith('$')))
        .then(messages => messages.map(m => m.content))
        .catch(() => {return []});
    })).then(arrays => {
      arrays.forEach(array => {
        if (array) {
          messages.push(...array);
        }
      })
    })
    .catch(error => this.loggerService.error(error));

    message.channel.send(this.markovService.buildMarkov(messages, args.variance));
  }
}