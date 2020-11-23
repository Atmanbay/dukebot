import emojiRegex from "emoji-regex";
import joi from "joi";

export default class {
  constructor(services) {
    this.responseService = services.response;
  }

  get details() {
    return {
      description: "Add a custom responder to the bot",
      args: joi
        .object({
          trigger: joi
            .string()
            .required()
            .note(
              "Word (or phrase if using quotes) that will trigger the response"
            ),

          response: joi
            .string()
            .note("Phrase or emoji that the bot will respond with"),

          delete: joi
            .boolean()
            .note("Flag to tell the bot to delete specified trigger"),
        })
        .xor("response", "delete")
        .rename("t", "trigger")
        .rename("r", "response")
        .rename("d", "delete"),
    };
  }

  execute({ message, args }) {
    if (args.delete) {
      this.responseService.delete(args.trigger);
      message.react("🗑️");
      return;
    }

    let responses = [];
    if (Array.isArray(args.response)) {
      responses = args.response.map(this.parseResponse);
    } else {
      responses.push(this.parseResponse(args.response));
    }

    this.responseService.save({
      trigger: args.trigger,
      responses: responses,
    });

    message.react("👌");
  }

  parseResponse(value) {
    let response = {};

    let isEmoji = emojiRegex();
    let emojiMatch = isEmoji.exec(value);
    if (emojiMatch) {
      let emoji = emojiMatch[0];
      response.value = emoji;
      response.type = "emoji";
      return response;
    }

    let isCustomEmoji = RegExp("<:(.*?):(.*?)>");
    let customEmojiMatch = value.match(isCustomEmoji);
    if (customEmojiMatch) {
      let customEmojiId = customEmojiMatch[2];
      response.value = customEmojiId;
      response.type = "customEmoji";
      return response;
    }

    if (typeof value === "string") {
      response.value = value;
      response.type = "string";
      return response;
    }

    return {};
  }
}
