module.exports = class {
  constructor(services) {
    this.guildService = services.guild;

    let handlers = services.file.getClasses("./*/index.js", __dirname);
    this.handlers = Object.values(handlers);
  }

  async handle(interaction) {
    if (!this.guildService.isThisGuild(interaction.guild.id)) {
      return;
    }

    this.handlers[0].handle(interaction);
  }
};
