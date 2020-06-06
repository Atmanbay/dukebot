import ContainerManager from './containerManager';

export default class GuildManager {
  constructor(guild, botUser) {
    this.guild = guild;
    let containerManager = new ContainerManager(guild, botUser);
    this.container = containerManager.build();
  }

  getHandlers() {
    return this.container.cradle.eventHandlers;
  }
}