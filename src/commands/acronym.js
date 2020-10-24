import Command from '../objects/command';
import joi from 'joi';

export default class AcronymCommand extends Command {
  constructor(container) {
    super();
    this.acronymService = container.acronymService;
    this.loggerService = container.loggerService;
    this.details = {
      name: 'acronym',
      description: 'Make up a (fake) acronym for a given word/phrase',
      args: joi.object({
        text: joi
          .string()
          .required()
          .note('Acronym that you want to know the meaning of')
      })
        .rename('t', 'text')
    };
  }

  async execute(message, args) {
    this.loggerService.info('trying...');
    let response = await this.acronymService.acronymize(args.text);
    message.channel.send(response);
  }
}