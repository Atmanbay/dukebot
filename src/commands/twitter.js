import Command from "../objects/command";
import joi from "joi";

export default class TwitterCommand extends Command {
  constructor(container) {
    super();
    this.twitterService = container.twitterService;
    this.details = {
      name: "twitter",
      description: "Subscribe to a specific Twitter account",
      args: joi
        .object({
          name: joi
            .string()
            .required()
            .note("Screen name (not nickname) of user you want to follow"),

          delete: joi.boolean().note("Boolean flag to end subscription"),
        })
        .rename("n", "name")
        .rename("d", "delete"),
    };
  }

  execute(message, args) {
    if (args.delete) {
      this.twitterService.unsubscribe(args.name);
    } else {
      let callback = (tweet) => {
        let url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
        message.channel.send(url);
      };

      this.twitterService.subscribe(args.name, callback);
    }

    message.react("👌");
  }
}
