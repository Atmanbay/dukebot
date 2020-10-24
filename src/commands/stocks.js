import { some } from "lodash";
import Command from "../objects/command";
import joi from "joi";

export default class StocksCommand extends Command {
  constructor(container) {
    super();
    this.stocksService = container.stocksService;
    this.details = {
      name: "stocks",
      aliases: ["stonks"],
      description: "Check the stocks leaderboard",
      args: joi
        .object({
          weekly: joi.boolean().note("Flag to show leaderboard for this week"),
        })
        .rename("w", "weekly"),
    };
  }

  async execute(message, args) {
    message.react("📈"); //Reacting to message immediately so user knows we're working on it
    let rows = await this.stocksService.fetchLeaderboard(args.weekly);

    // Use set column widths so that all columns line up
    // Creates spaces to fill each column dynamically
    let hasNegative = some(rows, function (r) {
      return r.percentChange.startsWith("-");
    });

    let columnWidths = [4, 17, 13];
    let response = rows.map((row) => {
      try {
        let rowString = "";

        let previousEntry = null;
        if (!args.weekly) {
          previousEntry = this.stocksService.getPreviousEntry(row.name);
        }

        rowString += row.rank;
        let cellLength = row.rank.length;
        if (previousEntry) {
          if (previousEntry.rank > row.rank) {
            // moved up
            rowString += "↑";
            cellLength += 1;
          } else if (previousEntry.rank < row.rank) {
            // moved down
            rowString += "↓";
            cellLength += 1;
          }
        }
        rowString += this.createBuffer(columnWidths[0], cellLength);

        rowString += row.name;
        rowString += this.createBuffer(columnWidths[1], row.name.length);

        rowString += row.value;
        rowString += this.createBuffer(columnWidths[2], row.value.length);

        if (hasNegative && !row.percentChange.startsWith("-")) {
          rowString += " ";
        } else if (!hasNegative) {
          rowString += " ";
        }

        rowString += row.percentChange + "%";

        if (previousEntry) {
          let percentDiff = row.percentChange - previousEntry.percentChange;
          if (percentDiff !== 0) {
            rowString += " (";
            if (percentDiff >= 0) {
              rowString += "+";
            }
            rowString += `${percentDiff.toFixed(2)})`;
          }
        }

        return rowString;
      } catch (error) {
        this.loggerService.error(error);
      }
    });

    response.unshift("    NAME             VALUE         GAIN/LOSS");
    response.unshift("```");
    response.push("```");

    if (!args.weekly) {
      this.stocksService.saveLeaderboard(rows);
    }

    return {
      message: response,
      args: {
        text: response.join("\n"),
      },
    };
  }

  createBuffer(columnWidth, cellLength) {
    let diff = columnWidth - cellLength;
    let buffer = "";
    for (let i = 0; i < diff; i++) {
      buffer += " ";
    }

    return buffer;
  }
}
