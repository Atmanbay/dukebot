import joi from "joi";

export default class {
  constructor(services) {
    this.twitterService = services.twitter;
  }

  get details() {
    return {
      description: "Subscribe to a specific Twitter account",
      args: joi
        .object({
          name: joi
            .string()
            .required()
            .note("Screen name (not nickname) of user you want to follow"),

          excludeReplies: joi
            .boolean()
            .default(false)
            .note("Flag to disable alerts on replies"),

          delete: joi.boolean().note("Boolean flag to end subscription"),
        })
        .rename("n", "name")
        .rename("e", "excludeReplies")
        .rename("d", "delete"),
    };
  }

  async execute({ message, args }) {
    if (args.delete) {
      this.twitterService.unsubscribe(args.name);
    } else {
      let callback = (tweet) => {
        let url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
        message.channel.send(url);
      };

      let userId = await this.twitterService.getUserId(args.name);
      let options = { includeReplies: args.includeReplies };

      this.twitterService.subscribe(userId, options, callback);

      this.twitterService.save(userId, options, message.channel.id);
    }

    message.react("👌");
  }
}
