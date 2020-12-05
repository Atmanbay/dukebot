export default class {
  constructor(services) {
    this.db = services.database.get("currency");
    this.beginningBalance = Number(services.config.currency.beginningBalance);
  }

  getBalance(userId) {
    let dbUser = this.db.find({ userId: userId }).value();
    if (!dbUser) {
      this.db
        .push({
          userId: userId,
          balance: this.beginningBalance,
        })
        .write();

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
}
