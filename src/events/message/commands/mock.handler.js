import joi from "joi";

export default class {
  constructor(services) {
    this.botUserService = services.botUser;
    this.guildService = services.guild;
    this.validatorService = services.validator;
  }

  get details() {
    return {
      description: "Mock some loser",
      args: joi
        .object({
          user: joi
            .any()
            .external(this.validatorService.user.bind(this.validatorService))
            .required()
            .note("User to mock"),

          text: joi
            .string()
            .note("Text to mock them with")
            .default("I'm a big ole dummy"),
        })
        .rename("u", "user")
        .rename("t", "text"),
    };
  }

  async execute({ message, args }) {
    let user = args.user;
    let nickname = user.nickname || user.user.username;

    // Currently only mocks using nickname, changing avi picture has a 5 minute cooldown
    // TODO: Add optional flag to change avatar picture?
    let botUser = this.botUserService.getBotUser();
    let botGuildUser = await this.guildService.getUser(botUser.id);
    let oldNickname = botGuildUser.nickname || botUser.username;

    botGuildUser.setNickname(nickname);
    message.channel.send(args.text);

    botGuildUser.setNickname(oldNickname);
  }
}
