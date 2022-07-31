const { SlashCommandBuilder } = require("@discordjs/builders");
const isEmpty = require("lodash/isEmpty");

module.exports = class {
  constructor(services) {
    this.jobsService = services.jobs;
    this.guildService = services.guild;
    this.tableService = services.table;
  }

  get getSlashCommand() {
    return new SlashCommandBuilder()
      .setName("jobs")
      .setDescription("Fetch the jobs leaderboard")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("User to check the jobs of")
          .setRequired(false)
      );
  }

  async execute(interaction) {
    let user = interaction.options.getUser("user");

    let result = [];
    if (user) {
      result = await this.jobsService.getJobs(user.user.id);
    } else {
      result = await this.jobsService.getJobs();
    }

    if (isEmpty(result)) {
      interaction.reply({ content: "No jobs found", ephemeral: true });
      return;
    }

    result = result.filter((job) => job.jobs > 0);
    result.sort((a, b) => b.jobs - a.jobs);

    let maxWidth = 0;
    let promises = result.map(async (job) => {
      let guildUser = await this.guildService.getUser(job.userId);
      if (!guildUser) {
        return null;
      }
      let name = guildUser.nickname || guildUser.user.username;
      if (name.length > maxWidth) {
        maxWidth = name.length;
      }

      return [name, job.jobs];
    });

    let rows = await Promise.all(promises);
    rows = rows.filter((row) => row);
    let colWidths = [maxWidth + 5, 5];
    let table = this.tableService.build(colWidths, rows);

    table.unshift("```");
    table.push("```");

    interaction.reply(table.join("\n"));
  }
};
