const Discord = require('discord.js');

export default class Bot {
  constructor(options) {
    this.token = options.token;
    this.databaseService = options.databaseService;
    this.loggerService = options.loggerService;
    this.client = new Discord.Client();
  }

  registerHandler(handler) {
    this.client.on(handler.event, handler.handle.bind(handler));
  }

  start() {
    let databaseService = this.databaseService;
    let loggerService = this.loggerService;
    let client = this.client;
    client.login(this.token).then((result) => {
      Array.from(client.guilds.cache.keys()).forEach((guildId) => {
        databaseService.generateDbFile(guildId);
      });
      console.log('Ready!');
      loggerService.info('Started');
    });
  }
}