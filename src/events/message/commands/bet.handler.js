import joi from "joi";

export default class {
  constructor(services) {
    this.betService = services.bet;
  }

  get details() {
    return {
      description: "Bet on stuff",
      args: joi
        .object({
          name: joi.string().note("The title of the bet to create"),
          odds: joi.string().note("The odds to set on the bet option"),
          amount: joi.number().note("The amount to place on the bet option"),
          list: joi.boolean().note("Show the current bet"),
          create: joi.boolean().note("Create a new bet"),
          addOption: joi.boolean().note("Create a new bet option"),
          placeBet: joi.boolean().note("Place a bet on a bet option"),
          close: joi.boolean().note("Close betting"),
          end: joi.boolean().note("End bet and pay out"),
        })
        .xor("list", "create", "addOption", "placeBet", "close", "end")
        .with("create", "name")
        .with("addOption", ["name", "odds"])
        .with("placeBet", ["name", "amount"])
        .with("end", "name")
        .rename("n", "name")
        .rename("o", "odds")
        .rename("a", "amount"),
    };
  }

  async execute({ message, args }) {
    if (args.list) {
      let response = await this.betService.list();
      message.channel.send(response);
      return;
    }

    if (args.create) {
      this.betService.create(args.name);
      message.channel.send("Bet created");
      return;
    }

    if (args.addOption) {
      let response = this.betService.addOption(args.name, args.odds);
      message.channel.send(response);
    }

    if (args.placeBet) {
      let response = this.betService.placeBet(
        message.author.id,
        args.name,
        args.amount
      );
      message.channel.send(response);
    }

    if (args.close) {
      this.betService.close();
      message.channel.send("Bet closed");
      return;
    }

    if (args.end) {
      let response = await this.betService.end(args.name);
      message.channel.send(response);
      return;
    }
  }
}
