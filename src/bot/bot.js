import ContainerManager from '../objects/containerManager';

const Discord = require('discord.js');

export default class Bot {
  constructor() {
    this.client = new Discord.Client();
  }

  start() {
    let containerManager = new ContainerManager();
    let container = containerManager.build();

    container.cradle.helpService.commands = container.cradle.commands;
    container.cradle.botUserService.setBotUser(this.client.user);

    container.cradle.eventHandlers.forEach((handler) => {
      this.client.on(handler.event, handler.handle.bind(handler));
    });

    this.client.login(container.cradle.configService.getToken());

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