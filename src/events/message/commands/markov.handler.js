import { isEmpty } from "lodash";
import joi from "joi";

export default class {
  constructor(services) {
    this.markovService = services.markov;
    this.guildService = services.guild;
    this.loggingService = services.logging;
    this.messageHistoryService = services.messageHistory;
    this.validatorService = services.validator;
  }

  get details() {
    return {
      description:
        "Creates a new message using a markov chain based on users previous messages",
      args: joi
        .object({
          user: joi
            .array()
            .items(
              joi
                .any()
                .external(
                  this.validatorService.user.bind(this.validatorService)
                )
            )
            .single()
            .note("Target user to markov (defaults to message author)"),

          variance: joi
            .number()
            .min(1)
            .max(10)
            .default(1)
            .note(
              "Forces markov generation to use more than this number of messages"
            ),

          chunkSize: joi
            .number()
            .min(1)
            .max(10)
            .default(2)
            .note("Set the size (in words) of each chunk. Default is 2"),

          maxTries: joi
            .number()
            .min(10)
            .max(500)
            .default(200)
            .note(
              "Set the number of max tries before it gives up. Default is 200"
            ),
        })
        .rename("u", "user")
        .rename("v", "variance")
        .rename("c", "chunkSize")
        .rename("m", "maxTries"),
    };
  }

  async execute({ message, args }) {
    try {
      let users = args.user ? args.user.map((u) => u.user) : [message.author];
      let promises = users.map(async (u) => {
        return this.messageHistoryService.fetchMessages(u.id);
      });

      let messages = await Promise.all(promises).then((arrays) =>
        arrays.flat()
      );
      if (isEmpty(messages)) {
        return;
      }

      let markov = this.markovService.buildMarkov({
        messages: messages,
        stateSize: args.chunkSize,
        maxTries: args.maxTries,
        variance: args.variance,
      });

      return {
        message: markov,
        args: {
          text: markov,
        },
      };
    } catch (error) {
      this.loggingService.error(error);
    }
  }
}
