export default class ConversionService {
  constructor(container) {
    this.loggerService = container.loggerService;
    this.guildService = container.guildService;
  }

  // Converts user/chanel IDs into the actual objects
  convert(value) {
    if (typeof value !== 'string') {
      return Promise.resolve(value);
    } else if (value.startsWith('<@!')) { //value is user
      return this.getUser(value);
    } else if (value.startsWith('<#')) { //value is channel
      return this.getChannel(value);
    } else {
      return Promise.resolve(value);
    }
  }

  getUser(userId) {
    let newVal = userId.substring(3, userId.length - 1);
    return this.guildService.getUser(newVal);
  }

  getChannel(channelId) {
    let newVal = channelId.substring(2, channelId.length - 1);
    return this.guildService.getChannel(newVal);
  }
}