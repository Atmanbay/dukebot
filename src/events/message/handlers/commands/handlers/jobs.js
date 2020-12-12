import joi from "joi";

export default class {
  constructor(services) {
    this.guildService = services.guild;
    this.jobsService = services.jobs;
    this.tableService = services.table;
    this.validatorService = services.validator;
  }

  get details() {
    return {
      description: "Hand out good jobs and bad jobs",
      args: joi
        .object({
          good: joi
            .array()
            .items(
              joi
                .string()
                .external(
                  this.validatorService.user.bind(this.validatorService)
                )
            )
            .single()
            .note("User to give a good job to"),

          bad: joi
            .array()
            .items(
              joi
                .string()
                .external(
                  this.validatorService.user.bind(this.validatorService)
                )
            )
            .single()
            .note("User to give a bad job to"),

          reason: joi.string().note("Reason for the jobs"),
        })
        .rename("g", "good")
        .rename("b", "bad")
        .rename("r", "reason"),
    };
  }

  async execute({ message, args }) {
    let jobs = [];
    if (args.good || args.bad) {
      if (args.good) {
        [...args.good].forEach((user) =>
          jobs.push(this.jobsService.addJob(user.id, 1))
        );
      }

      if (args.bad) {
        [...args.bad].forEach((user) =>
          jobs.push(this.jobsService.addJob(user.id, -1))
        );
      }
    } else {
      jobs = this.jobsService.getJobs();
    }

    jobs.sort((a, b) => b.jobs - a.jobs);

    let promises = jobs.map(async (job) => {
      let guildUser = await this.guildService.getUser(job.userId);
      let name = guildUser.nickname || guildUser.user.username;
      return [name, job.jobs];
    });

    let colWidths = [20, 5];
    let rows = await Promise.all(promises);
    let table = this.tableService.build(colWidths, rows);

    table.unshift("```");
    table.push("```");

    message.channel.send(table);
  }
}
