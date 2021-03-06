import joi from "joi";
import { isEmpty, sample } from "lodash";

export default class {
  constructor(services) {
    this.validatorService = services.validator;
  }

  get details() {
    return {
      description: "Pick a random user from a voice channel",
      args: joi
        .object({
          exclude: joi
            .array()
            .items(
              joi
                .any()
                .external(
                  this.validatorService.user.bind(this.validatorService)
                )
            )
            .single()
            .note("Users to exclude from process"),

          channel: joi
            .custom(this.validatorService.channel.bind(this.validatorService))
            .note(
              "Name of the audio channel to get pool of users from. Defaults to message author's channel"
            ),
        })
        .rename("e", "exclude")
        .rename("c", "channel"),
    };
  }

  async execute({ message, args }) {
    let channel = args.channel ? args.channel : message.member.voice.channel;
    if (!channel) {
      return;
    }

    let users = channel.members;
    if (args.exclude) {
      if (Array.isArray(args.exclude)) {
        users = users.filter((u) => !args.exclude.includes(u));
      } else {
        users = users.filter((u) => u.id !== args.exclude.id);
      }
    }

    if (isEmpty(users)) {
      message.channel.send("No valid users found");
      return;
    }

    let user = sample(users.map((user) => user));

    return {
      message: `I have chosen <@${user.id}>`,
      args: {
        user: user.id,
      },
    };
  }
}
