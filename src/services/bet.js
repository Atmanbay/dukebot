import { find } from "lodash";

export default class {
  constructor(services) {
    this.guildService = services.guild;
    this.currencyService = services.currency;
    this.db = services.database.get("bets");
  }

  getBalance(userId) {
    return this.currencyService.getBalance(userId);
  }

  async list() {
    let bet = this.db.first().value();
    if (!bet) {
      return "No current bet";
    }

    let response = [];

    let open = "(closed)";
    if (bet.open) {
      open = "(currently open, close betting with --close)";
    }
    response.push(`**Title:** ${bet.name} ${open}`);

    response.push("");
    response.push("**Options** (--addOption)");
    bet.options.forEach((option) => {
      response.push(`* ${option.name} at ${option.odds}`);
    });

    let promises = bet.bets.map(async (placedBet) => {
      let guildUser = await this.guildService.getUser(placedBet.userId);
      let nickname = guildUser.nickname || guildUser.user.username;
      return {
        nickname: nickname,
        bet: placedBet.name,
        amount: placedBet.amount,
      };
    });

    response.push("");
    response.push("**Bets placed** (--placeBet)");
    let placedBets = await Promise.all(promises);
    placedBets.forEach((placedBet) => {
      response.push(
        `* ${placedBet.nickname} has ${placedBet.amount} on ${placedBet.bet}`
      );
    });

    return response;
  }

  create(name) {
    if (this.db.first().value()) {
      return;
    }

    this.db
      .push({
        name: name,
        open: true,
        options: [],
        bets: [],
      })
      .write();
  }

  close() {
    this.db.first().set("open", false).write();
  }

  async end(name) {
    let bet = this.db.first().value();
    let option = find(bet.options, (option) => option.name === name);
    if (!option) {
      return "That option does not exist, please try again";
    }

    let response = ["Bet has ended. Here are the payouts:"];
    let odds = option.odds;
    let promises = bet.bets.map(async (placedBet) => {
      let guildUser = await this.guildService.getUser(placedBet.userId);
      let nickname = guildUser.nickname || guildUser.user.username;

      if (placedBet.name === option.name) {
        let splitOdds = odds.split("/");
        let payout =
          placedBet.amount + placedBet.amount * (splitOdds[0] / splitOdds[1]);

        payout = payout.toFixed(2);
        this.currencyService.addBalance(placedBet.userId, payout);

        return {
          nickname: nickname,
          payout: payout,
        };
      } else {
        return {
          nickname: nickname,
          payout: placedBet.amount * -1,
        };
      }
    });

    let rows = await Promise.all(promises);
    rows.forEach((row) => {
      response.push(`${row.nickname}: ${row.payout}`);
    });

    this.db.remove().write();
    return response;
  }

  addOption(name, odds) {
    let bet = this.db.first();
    if (!bet.value().open) {
      return "Bet is closed";
    }

    let regex = /\d+\/\d+/g;
    if (!odds.match(regex)) {
      return "Odds must be in X/Y format";
    }

    bet
      .update("options", (options) => {
        let val = find(options, (option) => option.name === name);
        if (val) {
          return options;
        }

        options.push({
          name: name,
          odds: odds,
        });
        return options;
      })
      .write();

    return "Option added";
  }

  placeBet(userId, name, amount) {
    let bet = this.db.first();
    if (!bet.value().open) {
      return "No longer accepting bets";
    }

    let option = find(bet.value().options, (option) => option.name === name);
    if (!option) {
      return "No option with that name was found";
    }

    let balance = this.currencyService.getBalance(userId);
    if (amount > balance) {
      return "The bet amount is greater than your current balance";
    }

    this.currencyService.addBalance(userId, amount * -1);

    bet
      .update("bets", (bets) => {
        bets.push({
          userId: userId,
          name: name,
          amount: amount,
        });

        return bets;
      })
      .write();

    return "Bet placed";
  }
}
