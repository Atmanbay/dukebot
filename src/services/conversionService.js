export default class ConversionService {
  constructor(container) {
    this.loggerService = container.loggerService;
    this.guildService = container.guildService;
  }

  // Converts user/chanel IDs into the actual objects
  async convert(value) {
    let promise;
    if (typeof value !== 'string') {
      promise = Promise.resolve(value);
    } else if (value.startsWith('<@!')) { //value is user
      promise = this.getUser(value);
    } else if (value.startsWith('<#')) { //value is channel
      promise = this.getChannel(value);
    } else {
      promise = Promise.resolve(value);
    }

    return promise;
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