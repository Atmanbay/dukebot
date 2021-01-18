import joi from "joi";

export default class {
  constructor(services) {
    this.configService = services.config;
    this.stocksService = services.stocks;
    this.tableService = services.table;
  }

  get details() {
    return {
      aliases: ["stonks"],
      description: "Check the stocks leaderboard",
      args: joi
        .object({
          ticker: joi.string().note("Ticker to check"),
          add: joi.boolean().note("Boolean flag to add ticker to watchlist"),
          remove: joi
            .boolean()
            .note("Boolean flag to remove ticker from watchlist"),
        })
        .oxor("remove", "add")
        .with("add", "ticker")
        .with("remove", "ticker")
        .rename("t", "ticker")
        .rename("a", "add")
        .rename("r", "remove"),
    };
  }

  async execute({ message, args }) {
    if (!this.configService.useStocks) {
      message.react("❌");
      return;
    }

    message.react("📈"); // React to message so user knows we're working on it

    if (args.ticker) {
      if (args.remove) {
        this.stocksService.remove(args.ticker);
        return;
      }

      let quote = await this.stocksService.lookup(args.ticker);
      let lines = [];
      lines.push(["Current", quote.c]);
      lines.push(["Open", quote.o]);

      let response = this.tableService.build([10, 10], lines);
      response.unshift(args.ticker);
      response.unshift("```");
      response.push("```");

      if (args.add) {
        this.stocksService.add(args.ticker, quote.c);
      }

      return {
        message: response,
        args: {
          text: response.join("\n"),
        },
      };
    }

    // Default to responding with watchlist
    let watchlist = await this.stocksService.getWatchlist();
    if (watchlist.length == 0) {
      return;
    }

    let response = this.tableService.build([10, 12, 10], watchlist);
    response.unshift("```");
    response.push("```");
    return {
      message: response,
      args: {
        text: response.join("\n"),
      },
    };
  }
}
