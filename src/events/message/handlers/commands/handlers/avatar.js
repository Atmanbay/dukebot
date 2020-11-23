import joi from "joi";

export default class {
  constructor(services) {
    this.botUserService = services.botUser;
  }

  get details() {
    return {
      description: "Change the bot's avatar",
      args: joi
        .object({
          url: joi.string().required().note("URL of image"),
        })
        .rename("u", "url"),
    };
  }

  execute({ args }) {
    let botUser = this.botUserService.getBotUser();
    botUser.setAvatar(args.url);
  }
}
