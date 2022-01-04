const { SlashCommandBuilder } = require("@discordjs/builders");
const moment = require("moment");
const isEmpty = require("lodash/isEmpty");

const TIMEFRAME = {
  WEEK: "WEEK",
  MONTH: "MONTH",
  YEAR: "YEAR",
  ALL: "ALL",
};

module.exports = class {
  constructor(services) {
    this.blazeService = services.blaze;
    this.guildService = services.guild;
    this.tableService = services.table;
  }

  get getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("blazes")
      .setDescription("Fetch the blazes leaderboard")
      .addStringOption((option) =>
        option
          .setName("timeframe")
          .setDescription("The timeframe to fetch blazes from")
          .addChoice("week", TIMEFRAME.WEEK)
          .addChoice("month", TIMEFRAME.MONTH)
          .addChoice("year", TIMEFRAME.YEAR)
          .addChoice("all", TIMEFRAME.ALL)
      );
  }

  async execute(interaction) {
    let timeframe = interaction.options.getString("timeframe");

    let start = moment().startOf("month");
    let end = moment().endOf("month");
    let frame = "this month";
    if (timeframe == TIMEFRAME.WEEK) {
      start = moment().startOf("week");
      end = moment().endOf("week");
      frame = "this week";
    } else if (timeframe == TIMEFRAME.MONTH) {
      start = moment().subtract(1, "month").startOf("month");
      end = moment().subtract(1, "month").endOf("month");
      frame = "last month";
    } else if (timeframe == TIMEFRAME.YEAR) {
      start = moment().startOf("year");
      end = moment().endOf("year");
      frame = "this year";
    } else if (timeframe == TIMEFRAME.ALL) {
      start = null;
      end = null;
      frame = null;
    }

    let result = await this.blazeService.getBlazes(start, end);
    if (isEmpty(result)) {
      interaction.reply("No blazes for the specified date range");
      return;
    }

    result = result.filter((blaze) => blaze.blazes > 0);
    result.sort((a, b) => b.blazes - a.blazes);

    let maxWidth = 0;
    let promises = result.map(async (blaze) => {
      let guildUser = await this.guildService.getUser(blaze.userId);
      if (!guildUser) {
        return null;
      }
      let name = guildUser.nickname || guildUser.user.username;
      if (name.length > maxWidth) {
        maxWidth = name.length;
      }

      return [name, blaze.blazes];
    });

    let rows = await Promise.all(promises);
    rows = rows.filter((row) => row);
    let colWidths = [maxWidth + 5, 5];
    let table = this.tableService.build(colWidths, rows);

    table.unshift("```");
    table.push("```");

    if (frame) {
      table.unshift(`**Blazes ${frame}**`);
    }

    interaction.reply(table.join("\n"));
  }
};
