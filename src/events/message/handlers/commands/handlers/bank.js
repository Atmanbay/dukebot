import joi from "joi";

export default class {
  constructor(services) {
    this.bankService = services.bank;
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
      this.bankService.send(message.author.id, [...args.user], args.amount);
      message.channel.send("Dukes sent successfully!");

      return;
    }

    if (args.rate) {
      let rate = this.bankService.getConversion();
      message.channel.send(`1 job can be converted to ${rate} Dukes`);

      return;
    }

    if (args.convert) {
      let userId = message.author.id;
      let jobs = this.jobsService.getJobs(userId);
      let rate = this.bankService.getConversion();

      let amount = Number.parseFloat(jobs * rate).toFixed(2);

      this.bankService.addBalance(userId, amount);
      message.channel.send(
        `${jobs} jobs have been converted into ${amount} Dukes`
      );

      this.jobsService.setJobs(userId, 0);
      return;
    }

    let balances = this.bankService.getBalances();

    balances.sort((a, b) => b.balance - a.balance);

    let maxWidth = 0;
    let promises = balances.map(async (balance) => {
      let guildUser = await this.guildService.getUser(balance.userId);
      let name = guildUser.nickname || guildUser.user.username;
      if (name.length > maxWidth) {
        maxWidth = name.length;
      }

      return [name, balance.balance];
    });

    let rows = await Promise.all(promises);
    let colWidths = [maxWidth + 5, 5];
    let table = this.tableService.build(colWidths, rows);

    table.unshift("```");
    table.push("```");

    message.channel.send(table);
  }
}
