import joi from "joi";

export default class {
  constructor(services) {
    this.banService = services.ban;
    this.validatorService = services.validator;
  }

  get details() {
    return {
      description: "Prevent a user from interacting with the bot for a while",
      args: joi
        .object({
          user: joi
            .any()
            .external(this.validatorService.user.bind(this.validatorService))
            .required()
            .note("The user to ban"),
        })
        .rename("u", "user"),
    };
  }

  async execute({ message, args }) {
    message.channel.send("User has been banned");
    await this.banService.banUser(args.user.user.id).then(() => {
      message.channel.send("User has been unbanned");
    });
  }
}
