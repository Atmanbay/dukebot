import joi from "joi";

export default class {
  constructor(services) {
    this.acronymService = services.acronym;
    this.loggerService = services.logger;
  }

  get details() {
    return {
      description: "Make up a (fake) acronym for a given word/phrase",
      args: joi
        .object({
          text: joi
            .string()
            .required()
            .note("Acronym that you want to know the meaning of"),
        })
        .rename("t", "text"),
    };
  }

  async execute({ args }) {
    let response = await this.acronymService.acronymize(args.text);

    return {
      message: response,
      args: {
        text: response,
      },
    };
  }
}
