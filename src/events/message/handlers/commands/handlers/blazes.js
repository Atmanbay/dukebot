import moment from "moment";
import { isEmpty } from "lodash";
import joi from "joi";

export default class {
  constructor(services) {
    this.blazeService = services.blaze;
    this.tableService = services.table;
  }

  get details() {
    return {
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

  async execute({ message, args }) {
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

    let result = await this.blazeService.getBlazes(start, end);
    if (isEmpty(result)) {
      message.channel.send("No blazes for the specified date range");
      return;
    }
    let header = "**Blazes";
    if (frame) {
      header += ` ${frame}`;
    }

    header += "**";

    let colWidths = [20, 5];
    let table = this.tableService.build(colWidths, result);

    table.unshift("```");
    table.push("```");

    if (frame) {
      table.unshift(`**Blazes ${frame}**`);
    }

    message.channel.send(table);
  }
}
