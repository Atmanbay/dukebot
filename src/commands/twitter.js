import Command from "../objects/command";
import joi from "joi";

export default class TwitterCommand extends Command {
  constructor(container) {
    super();
    this.twitterService = container.twitterService;
    this.details = {
      name: "twitter",
      description: "Hand out good jobs and bad jobs",
      args: joi
        .object({
          name: joi
            .string()
            .required()
            .note("Screen name (not nickname) of user you want to follow"),
        })
        .rename("n", "name"),
    };
  }

  execute(message, args) {
    let callback = (tweet) => {
      let url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
      message.channel.send(url);
    };

    this.twitterService.subscribe(args.name, callback);
    message.react("👌");
  }
}
