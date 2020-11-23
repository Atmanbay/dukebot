export default class {
  constructor(services) {
    this.guildService = services.guild;

    let handlers = services.file.getClasses("handlers/*/index.js", __dirname);

    this.handlers = Object.values(handlers);
  }

  async handle(message) {
    if (message.author.bot) {
      return;
    }

    if (!this.guildService.isThisGuild(message.guild)) {
      return;
    }

    for (let handler of this.handlers) {
      let result = await handler.handle(message);
      if (result) {
        break;
      }
    }
  }
}
