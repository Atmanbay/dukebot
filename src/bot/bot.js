import ContainerManager from '../objects/containerManager';
import ConfigService from '../services/configService';

const Discord = require('discord.js');

export default class Bot {
  constructor() {
    this.client = new Discord.Client();
  }

  start() {
    this.client.on('ready', () => {
      let guilds = this.client.guilds.cache;
      guilds.forEach((guild) => {
        let guildContainerManager = new ContainerManager({
          guild: guild,
          botUser: this.client.user
        });

        let guildContainer = guildContainerManager.build();

        guildContainer.cradle.helpService.commands = guildContainer.cradle.commands;
        guildContainer.cradle.eventHandlers.forEach((handler) => {
          this.client.on(handler.event, handler.handle.bind(handler));
        });
      });

      let dmContainerManager = new ContainerManager({
        guild: {
          id: 'dm'
        },
        botUser: this.client.user
      });

      let dmContainer = dmContainerManager.build();

      dmContainer.cradle.helpService.commands = dmContainer.cradle.commands;
      dmContainer.cradle.eventHandlers.forEach((handler) => {
        this.client.on(handler.event, handler.handle.bind(handler));
      });

      console.log('Ready!');
    });

    let configService = new ConfigService();
    this.client.login(configService.getToken());
  }
}