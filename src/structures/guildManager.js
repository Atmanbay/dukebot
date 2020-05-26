import ServiceManager from './serviceManager';

export default class GuildManager {
  constructor(guild) {
    this.guild = guild;
    let serviceManager = new ServiceManager(guild);
    this.services = serviceManager.build();
  }

  getHandlers() {
    let guildEventHandlers = [];
    let eventHandlers = this.services.resolve('loaderService').load(`${__dirname}/../eventHandlers`);
    eventHandlers.forEach((handler) => {
      let handlerInstance = new handler(this.services);
      let handlerObject = {
        event: handlerInstance.event,
        handle: function(event) {
          if (event.guild.id !== this.guild.id) {
            return;
          }
  
          handlerInstance.handle(event);
        }
      };

      guildEventHandlers.push(handlerObject);
    });

    return guildEventHandlers;
  }
}