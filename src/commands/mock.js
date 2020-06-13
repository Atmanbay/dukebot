import Command from '../objects/command';

export default class MockCommand extends Command {
  constructor(container) {
    super();
    this.botUserService = container.botUserService;
    this.guildService = container.guildService;
    this.details = {
      name: 'mock',
      description: 'Mock some loser',
      args: [
        {
          name: 'u',
          description: 'User to mock',
          optional: false
        },
        {
          name: 't',
          description: 'Text to mock them with',
          optional: true
        }
      ]
    };
  }

  execute(message, args) {
    let text = "I'm a big ole dummy";
    if (args.t) {
      text = args.t;
    }

    let user = args.u;
    let nickname = user.nickname || user.user.username;

    let botUser = this.botUserService.getBotUser();
    this.guildService.getUser(botUser.id).then((botGuildUser) => {
      let oldNickname = botGuildUser.nickname || botUser.username;

      botGuildUser.setNickname(nickname);
      message.channel.send(text);

      botGuildUser.setNickname(oldNickname);
    });
  }
}