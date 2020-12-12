export default class {
  constructor(services) {
    this.db = services.database.get("bank");
    this.beginningBalance = Number(services.config.bank.beginningBalance);
    this.jobToDukes = Number(services.config.bank.jobToDukes);
  }

  getBalances() {
    return this.db.value();
  }

  getBalance(userId) {
    let dbUser = this.db.find({ userId: userId }).value();
    if (!dbUser) {
      this.db.push({
        userId: userId,
        balance: this.beginningBalance,
      });

      return this.beginningBalance;
    }

    return dbUser.balance;
  }

  addBalance(userId, amount) {
    this.db
      .find({ userId: userId })
      .update("balance", (balance) => Number(balance) + Number(amount))
      .write();
  }

  setBalance(userId, balance) {
    this.db.find({ userId: userId }).set("balance", Number(balance)).write();
  }

  send(fromUserId, users, amount) {
    users.forEach((user) => {
      let dbUser = this.db.find({ userId: user.id });
      if (!dbUser.value()) {
        this.db
          .push({
            userId: user.id,
            balance: this.beginningBalance,
          })
          .write();

        dbUser = this.db.find({ userId: user.id });
      }

      this.addBalance(fromUserId, -1 * amount);
      this.addBalance(user.id, amount);
    });
  }

  getConversion() {
    let balances = this.getBalances();
    let count = balances.length;
    let total = 0;
    this.db.value().forEach((a) => (total += a.balance));

    let ratio = (count * this.beginningBalance) / total;

    ratio = (ratio + 1.0) / 2; // try to smooth it out a bit

    return (ratio * this.jobToDukes).toFixed(2);
  }
}
