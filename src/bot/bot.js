import GuildManager from '../objects/guildManager';
import ConfigService from '../services/configService';
import ContainerManager from '../objects/containerManager';

const Discord = require('discord.js');

export default class Bot {
  constructor() {
    this.client = new Discord.Client();
  }

  start() {
    let containerManager = new ContainerManager(this.client.user);
    let container = containerManager.build();
    let configService = container.cradle.configService;

    container.cradle.eventHandlers.forEach((handler) => {
      this.client.on(handler.event, handler.handle.bind(handler));
    });

    this.client.login(configService.getToken());

    // let client = this.client;
    // let configService = new ConfigService();
    // let token = configService.getToken();

    // client.login(token).then(() => {
    //   client.guilds.cache.forEach((guild) => {
    //     let guildManager = new GuildManager(guild, client.user);
    //     guildManager.getHandlers().forEach((handler) => {
    //       client.on(handler.event, handler.handle.bind(handler));
    //     });
    //   });
    //   console.log('Ready!');
    // });
  }
}