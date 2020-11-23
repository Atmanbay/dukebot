import { isEmpty } from "lodash";
import joi from "joi";

export default class {
  constructor(services) {
    this.jobsService = services.jobs;
    this.loggerService = services.logger;
    this.validatorService = services.validator;
  }

  get details() {
    return {
      description: "Hand out good jobs and bad jobs",
      args: joi
        .object({
          good: joi
            .array()
            .items(
              joi
                .string()
                .external(
                  this.validatorService.user.bind(this.validatorService)
                )
            )
            .single()
            .note("User to give a good job to"),

          bad: joi
            .array()
            .items(
              joi
                .string()
                .external(
                  this.validatorService.user.bind(this.validatorService)
                )
            )
            .single()
            .note("User to give a bad job to"),

          reason: joi.string().note("Reason for the jobs"),
        })
        .without("user", ["reason", "good", "bad"])
        .rename("g", "good")
        .rename("b", "bad")
        .rename("r", "reason"),
    };
  }

  async execute({ message, args }) {
    try {
      // If no good or bad jobs handed out then get job counts
      if (!args.good && !args.bad) {
        let user = args.user ? args.user : message.author;
        let result = await this.jobsService.getJobs(user);
        if (!result) {
          message.channel.send("No jobs found");
        }
        let response = `${result.nickname}\n${result.goodJobs} good jobs\n${result.badJobs} bad jobs`;

        return {
          message: response,
          args: {
            text: response,
          },
        };
      }

      let goodJobs = null;
      if (args.good) {
        //Passing in message author to prevent giving yourself good jobs
        goodJobs = this.jobsService.resolveJobs(
          args.good,
          "good",
          message.author.id
        );
      }

      let badJobs = null;
      if (args.bad) {
        badJobs = this.jobsService.resolveJobs(args.bad, "bad");
      }

      let response = "The following jobs have been given out";
      if (args.reason) {
        response += ` for ${args.reason}`;
      }

      response += "\n\n";

      if (!isEmpty(goodJobs)) {
        response += "**Good Jobs**";
        Object.keys(goodJobs).forEach((key) => {
          let value = goodJobs[key];

          response += `\n${key}: ${value}`;
        });

        if (!isEmpty(badJobs)) {
          response += "\n\n";
        }
      }

      if (!isEmpty(badJobs)) {
        response += "**Bad Jobs**";
        Object.keys(badJobs).forEach((key) => {
          let value = badJobs[key];

          response += `\n${key}: ${value}`;
        });
      }

      return {
        message: response,
        args: {
          text: response,
        },
      };
    } catch (error) {
      this.loggerService.error(error);
    }
  }
}
