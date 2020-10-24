import Command from "../objects/command";
import joi from "joi";

export default class DefineCommand extends Command {
  constructor(container) {
    super();
    this.defineService = container.defineService;
    this.details = {
      name: "define",
      description: "Use UrbanDictionary to find the definition of a word",
      args: joi
        .object({
          text: joi
            .string()
            .required()
            .note("The text (or phrase if using quotes) to define"),
        })
        .rename("t", "text"),
    };
  }

  async execute(message, args) {
    let definition = await this.defineService.define(args.text);
    if (!definition) {
      message.channel.send("No definitions found");
      return;
    }

    let response = [];
    response.push(`**${args.text}**`);
    response.push("");
    response.push(definition.definition);
    response.push("");
    response.push(`_${definition.example}_`);

    return {
      message: response,
      args: {
        text: response.join("\n"),
      },
    };
  }
}
