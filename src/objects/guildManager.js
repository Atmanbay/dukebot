import ContainerManager from './containerManager';

export default class GuildManager {
  constructor(guild) {
    this.guild = guild;
    let containerManager = new ContainerManager(guild);
    this.container = containerManager.build();
  }

  getHandlers() {
    let guildEventHandlers = [];
    this.container.cradle.eventHandlers.forEach((handler) => {
      let handlerObject = {
        event: handler.event,
        handle: function(event) {
          if (event.guild.id !== this.guild.id) {
            return;
          }
  
          handler.handle(event);
        }
      };

      guildEventHandlers.push(handlerObject);
    });

    return guildEventHandlers;
  }
}