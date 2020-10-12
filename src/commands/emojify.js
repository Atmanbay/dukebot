import Command from '../objects/command';
import joi from 'joi';

export default class EmojifyCommand extends Command {
  constructor(container) {
    super();
    this.emojifyService = container.emojifyService;
    this.details = {
      name: 'emojify',
      description: 'Turns text into an emojipasta',
      args: joi.object({
        text: joi
          .string()
          .required()
          .note('Text to convert into an emojipasta'),
      })
        .rename('t', 'text')
    }
  }

  execute(message, args) {
    message.channel.send(this.emojifyService.emojifyText(args.text));
  }
}