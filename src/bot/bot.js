import ContainerManager from '../objects/containerManager';
import ConfigService from '../services/configService';

const Discord = require('discord.js');

export default class Bot {
  constructor() {
    this.client = new Discord.Client();
  }

  // Creates a ContainerManager for a specific guild
  // Means each guild has its own event handling, database, and logging
  buildGuildContainer(options) {
    let guildContainerManager = new ContainerManager(options);

    let guildContainer = guildContainerManager.build();

    // Set commands of helpService here to avoid circular reference
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
    this.client.login(configService.token);
  }
}