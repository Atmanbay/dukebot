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
    message.react('⌛');
    let user = args.user ? args.user : message.author;

    let channels = this.guildService.getChannels('text');
    let messages = [];
    await Promise.all(channels.map(async (channel) => {
      try {
        let channelMessages = await this.fetchMessages(channel);
        if (!channelMessages) {
          return [];
        }

        return channelMessages
          .filter(m => m.author.id === user.id && !m.content.startsWith(this.commandPrefix))
          .map(m => m.content);
      } catch (error) {
        return [];
      }
    })).then(arrays => {
      arrays.forEach(array => {
        if (array) {
          messages.push(...array);
        }
      })
    })
    .catch(error => this.loggerService.error(error));

    message.channel.send(this.markovService.buildMarkov({
      messages: messages,
      stateSize: args.chunkSize,
      maxTries: args.maxTries,
      variance: args.variance
    }));
  }

  async fetchMessages(channel, limit = 500) {
    let messages = [];
    let last_id = null;
    while (true) {
      try {
        let options = {
          limit: 100
        }
  
        if (last_id) {
          options.before = last_id;
        }
  
        let messageBatch = await channel.messages.fetch(options).catch((error) => {
          return null;
        });
  
        if (!messageBatch) {
          return null;
        }
  
        messages.push(...messageBatch);
        if (messageBatch.last()) {
          last_id = messageBatch.last().id;
        } else {
          last_id = null;
        }
  
        if (messageBatch.size != 100 || messages.length >= limit) {
          break;
        }
      } catch (error) {
        this.loggerService.error(error);
        return null;
      }
    }

    return messages.map(m => m[1]);
  }
}