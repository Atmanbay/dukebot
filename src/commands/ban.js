import Command from "../objects/command";
import joi from "joi";

export default class BanCommand extends Command {
  constructor(container) {
    super();
    this.banService = container.banService;
    let validator = container.validatorService;
    this.details = {
      name: "ban",
      description: "Prevent a user from interacting with the bot for a while",
      args: joi
        .object({
          user: joi
            .any()
            .external(validator.user.bind(validator))
            .required()
            .note("The user to ban"),
        })
        .rename("u", "user"),
    };
  }

  async execute(message, args) {
    message.channel.send("User has been banned");
    await this.banService.banUser(args.user.user.id).then(() => {
      message.channel.send("User has been unbanned");
    });
  }
}
