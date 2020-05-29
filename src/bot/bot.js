import GuildManager from '../objects/guildManager';
import ConfigService from '../services/configService';

const Discord = require('discord.js');

export default class Bot {
  constructor() {
    this.client = new Discord.Client();
  }

  registerHandler(handler) {
    this.client.on(handler.event, handler.handle.bind(handler));
  }

  start() {
    let client = this.client;
    let configService = new ConfigService();
    let token = configService.getToken();

    client.login(token).then((result) => {
      client.guilds.cache.forEach((guild) => {
        let guildManager = new GuildManager(guild);
        guildManager.getHandlers().forEach((handler) => {
          client.on(handler.event, handler.handle.bind(guildManager));
        });
      });
      console.log('Ready!');
    });
  }
}