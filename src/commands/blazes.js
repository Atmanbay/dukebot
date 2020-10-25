import Command from "../objects/command";
import moment from "moment";
import { isEmpty } from "lodash";
import joi from "joi";

export default class BlazeItCommand extends Command {
  constructor(container) {
    super();
    this.blazeService = container.blazeService;
    this.loggerService = container.loggerService;
    this.details = {
      name: "blazes",
      description: "Get the sorted leaderboard of blazes for the month",
      args: joi
        .object({
          week: joi.boolean().note("Flag to show scores for this week"),

          month: joi.boolean().note("Flag to show scores for this month"),

          year: joi.boolean().note("Flag to show scores for this year"),

          all: joi.boolean().note("Flag to show scores for all time"),

          lastMonth: joi.boolean().note("Flag to show scores for last month"),
        })
        .oxor("week", "month", "year", "all", "lastMonth")
        .rename("w", "week")
        .rename("m", "month")
        .rename("y", "year")
        .rename("a", "all")
        .rename("l", "lastMonth"),
    };
  }

  async execute(message, args) {
    let start = moment().startOf("month");
    let end = moment().endOf("month");
    let frame = "this month";
    if (args.week) {
      start = moment().startOf("week");
      end = moment().endOf("week");
      frame = "this week";
    } else if (args.year) {
      start = moment().startOf("year");
      end = moment().endOf("year");
      frame = "this year";
    } else if (args.lastMonth) {
      start = moment().subtract(1, "month").startOf("month");
      end = moment().subtract(1, "month").endOf("month");
      frame = "last month";
    } else if (args.all) {
      start = null;
      end = null;
      frame = null;
    }

    try {
      let result = await this.blazeService.getBlazes(start, end);
      if (isEmpty(result)) {
        return;
      }
      let response = "**Blazes";
      if (frame) {
        response += ` ${frame}`;
      }

      response += "** \n";
      let lines = [];
      result.forEach((entry) => {
        let name = entry[0];
        let count = entry[1];
        lines.push(`${name}: ${count}`);
      });

      response += lines.join("\n");
      message.channel.send(response);
    } catch (error) {
      this.loggerService.error("Error when creating blazes response", error);
    }
  }
}
