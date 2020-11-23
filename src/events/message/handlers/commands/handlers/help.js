import joi from "joi";

export default class {
  constructor(services) {
    this.helpService = services.help;
  }

  get details() {
    return {
      description: "Get help",
      args: joi
        .object({
          name: joi.string().note("Name of command to get help with"),
        })
        .rename("n", "name"),
    };
  }

  execute({ args }) {
    let response = [];
    if (args.name) {
      response = this.helpService.getCommandHelpMessage(args.name);
    } else {
      response = this.helpService.getBotHelpMessage();
    }

    return {
      message: response,
      args: {
        text: response,
      },
    };
  }
}
