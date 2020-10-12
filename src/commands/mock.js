import Command from '../objects/command';
import joi from 'joi';

export default class MockCommand extends Command {
  constructor(container) {
    super();
    this.botUserService = container.botUserService;
    this.guildService = container.guildService;
    let validator = container.validatorService;
    this.details = {
      name: 'mock',
      description: 'Mock some loser',
      args: joi.object({
        user: joi
          .custom(validator.user.bind(validator))
          .required()
          .note('User to mock'),

        text: joi
          .string()
          .note('Text to mock them with')
          .default('I\'m a big ole dummy')
      })
        .rename('u', 'user')
        .rename('t', 'text')
    };
  }

  async execute(message, args) {
    let user = args.user;
    let nickname = user.nickname || user.user.username;

    // Currently only mocks using nickname, changing avi picture has a 5 minute cooldown
    // TODO: Add optional flag to change avatar picture?
    let botUser = this.botUserService.getBotUser();
    let botGuildUser = this.guildService.getUser(botUser.id);
    let oldNickname = botGuildUser.nickname || botUser.username;

    botGuildUser.setNickname(nickname);
    message.channel.send(args.text);

    botGuildUser.setNickname(oldNickname);
  }
}