import Command from "../objects/command";
import joi from "joi";

export default class EmojifyCommand extends Command {
  constructor(container) {
    super();
    this.emojifyService = container.emojifyService;
    this.details = {
      name: "emojify",
      description: "Turns text into an emojipasta",
      args: joi
        .object({
          text: joi
            .string()
            .max(1500)
            .note("Text to convert into an emojipasta"),

          word: joi
            .string()
            .note(
              "Word (or phrase if using quotes) that will trigger the response"
            ),

          emoji: joi
            .string()
            .note("Phrase or emoji that the bot will respond with"),

          delete: joi
            .boolean()
            .note("Flag to delete the associated word/emoji pair"),

          parse: joi
            .boolean()
            .note(
              "Flag to tell the command to parse and save the given emojipasta as word:emoji pairings"
            ),
        })
        .and("word", "emoji")
        .with("delete", "emoji")
        .with("parse", "text")
        .xor("word", "text")
        .rename("t", "text")
        .rename("w", "word")
        .rename("e", "emoji")
        .rename("d", "delete")
        .rename("p", "parse"),
    };
  }

  execute(message, args) {
    if (args.text) {
      if (args.parse) {
        let mappings = this.emojifyService.parseEmojipasta(args.text);
        mappings.forEach((m) => {
          m.emojis.forEach((e) => {
            this.emojifyService.saveMapping(m.word, e);
          });
        });

        message.react("👌");
      } else {
        return {
          message: this.emojifyService.emojifyText(args.text),
          args: {
            text: this.emojifyService.emojifyText(args.text),
          },
        };
      }
    } else if (args.delete) {
      this.emojifyService.deleteMapping(args.word, args.emoji);
      message.react("🗑️");
    } else {
      this.emojifyService.saveMapping(args.word, args.emoji);
      message.react("👌");
    }
  }
}
