import ContainerManager from '../objects/containerManager';
import ConfigService from '../services/configService';

const Discord = require('discord.js');

export default class Bot {
  constructor() {
    this.client = new Discord.Client();
  }

  buildGuildContainer(options) {
    let guildContainerManager = new ContainerManager(options);

    let guildContainer = guildContainerManager.build();

    guildContainer.cradle.helpService.commands = guildContainer.cradle.commands;
    guildContainer.cradle.eventHandlers.forEach((handler) => {
      this.client.on(handler.event, handler.handle.bind(handler));
    });

    guildContainer.cradle.loggerService.info('Ready!');
  }

  start() {
    this.client.on('ready', () => {
      let guilds = this.client.guilds.cache;
      guilds.forEach((guild) => {
        this.buildGuildContainer({
          guild: guild,
          botUser: this.client.user
        });
      });

      this.buildGuildContainer({
        guild: {
          id: 'dm'
        },
        botUser: this.client.user
      });
    });

    let configService = new ConfigService();
    this.client.login(configService.getToken());
  }
}