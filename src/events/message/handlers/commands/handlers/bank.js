import joi from "joi";

export default class {
  constructor(services) {
    this.currencyService = services.currency;
    this.guildService = services.guild;
    this.jobsService = services.jobs;
    this.tableService = services.table;
    this.validatorService = services.validator;
  }

  get details() {
    return {
      description: "The Bank of Duke",
      args: joi
        .object({
          user: joi
            .array()
            .items(
              joi
                .string()
                .external(
                  this.validatorService.user.bind(this.validatorService)
                )
            )
            .single()
            .note("User to give Dukes to"),

          amount: joi.number().note("Amount to give the user"),
          rate: joi.boolean().note("Get the conversion rate of Jobs to Dukes"),
          convert: joi.boolean().note("Converts your Jobs to Dukes"),
        })
        .with("user", "amount")
        .rename("u", "user")
        .rename("a", "amount")
        .rename("r", "rate")
        .rename("c", "convert"),
    };
  }

  async execute({ message, args }) {
    if (args.user) {
      this.currencyService.send(message.author.id, [...args.user], args.amount);
      message.channel.send("Dukes sent successfully!");

      return;
    }

    if (args.rate) {
      let rate = this.currencyService.getConversion();
      message.channel.send(`1 job can be converted to ${rate} Dukes`);

      return;
    }

    if (args.convert) {
      let userId = message.author.id;
      let jobs = this.jobsService.getJobs(userId);
      let rate = this.currencyService.getConversion();

      let amount = Number.parseFloat(jobs * rate).toFixed(2);

      this.currencyService.addBalance(userId, amount);
      message.channel.send(
        `${jobs} jobs have been converted into ${amount} Dukes`
      );

      this.jobsService.setJobs(userId, 0);
      return;
    }

    let balances = this.currencyService.getBalances();

    let promises = balances.map(async (balance) => {
      let guildUser = await this.guildService.getUser(balance.userId);
      let name = guildUser.nickname || guildUser.user.username;
      return [name, balance.balance];
    });

    let colWidths = [20, 5];
    let rows = await Promise.all(promises);
    let table = this.tableService.build(colWidths, rows);

    table.unshift("```");
    table.push("```");

    message.channel.send(table);
  }
}
