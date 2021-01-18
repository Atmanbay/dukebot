const finnhub = require("finnhub");
const { promisify } = require("es6-promisify");

export default class {
  constructor(services) {
    this.db = services.database.get("stocks");
    this.loggingService = services.logging;

    let api_key = finnhub.ApiClient.instance.authentications["api_key"];
    api_key.apiKey = services.config.stocks.apiKey;
    this.client = new finnhub.DefaultApi();
  }

  lookup(ticker) {
    let quote = promisify(this.client.quote.bind(this.client));
    return quote(ticker);
  }

  update(ticker, current) {
    let entry = this.db.find({ ticker: ticker });
    if (!entry.value()) {
      return;
    }

    entry.update("price", () => current).write();
  }

  remove(ticker) {
    this.db.remove({ ticker: ticker }).write();
  }

  add(ticker, current) {
    let entry = this.db.find({ ticker: ticker });
    if (entry.value()) {
      return;
    }

    this.db
      .push({
        ticker: ticker,
        price: current,
      })
      .write();
  }

  async getWatchlist() {
    let watchlist = this.db.value();
    if (watchlist.length == 0) {
      return [];
    }

    watchlist.sort((a, b) => a.ticker.localeCompare(b.ticker));

    let promises = watchlist.map(async (entry) => {
      let row = [];

      row.push(entry.ticker);
      row.push(entry.price);

      let quote = await this.lookup(entry.ticker);
      row.push(quote.c);

      let percentChange = ((quote.c - entry.price) / entry.price) * 100;
      row.push(`${percentChange.toFixed(2)}%`);

      this.update(entry.ticker, quote.c);
      return row;
    });

    let rows = await Promise.all(promises);
    rows.unshift(["Ticker", "Previous", "Current", "% Change"]);
    return rows;
  }
}
