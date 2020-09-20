import Command from "../objects/command";
import joi from 'joi';
import { isEmpty, sample } from 'lodash';

export default class PickCommand extends Command {
  constructor(container) {
    super();
    let validator = container.validatorService;
    this.details = {
      name: 'pick',
      description: 'Pick a random user from a voice channel',
      args: joi.object({
        exclude: joi
          .array()
          .items(joi.custom(validator.user.bind(validator)))
          .single()
          .note('Users to exclude from process'),

        channel: joi
          .custom(validator.channel.bind(validator))
          .note('Name of the audio channel to get pool of users from. Defaults to message author\'s channel'),
      })
        .rename('e', 'exclude')
        .rename('c', 'channel')
    };
  }
  
  async execute(message, args) {
    let channel = args.channel ? args.channel : message.member.voice.channel;
    if (!channel) {
      return;
    }

    let users = channel.members;
    if (args.exclude) {
      if (Array.isArray(args.exclude)) {
        users = users.filter(u => !args.exclude.includes(u));
      } else {
        users = users.filter(u => u.id !== args.exclude.id);
      }
    }

    if (isEmpty(users)) {
      message.channel.send('No valid users found');
      return;
    }

    let user = sample(users.map(user => user));
    message.channel.send(`I have chosen <@${user.id}>`)
  }
}