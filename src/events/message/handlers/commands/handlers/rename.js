import joi from "joi";

export default class {
  constructor(services) {
    this.botUserService = services.botUser;
  }

  get details() {
    return {
      description: "Rename the bot",
      args: joi
        .object({
          text: joi.string().required().note("New name for the bot"),
        })
        .rename("t", "text"),
    };
  }

  async execute({ message, args }) {
    let botUserId = this.botUserService.getBotUser().id;
    let guildUser = await message.guild.members.fetch(botUserId);

    guildUser.setNickname(args.text);
  }
}
