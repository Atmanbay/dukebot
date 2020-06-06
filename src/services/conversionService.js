import LoggerService from './loggerService';

export default class ConversionService {
  constructor(container) {
    this.loggerService = container.loggerService;
    this.guild = container.guild;
  }

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
    return Promise.resolve(this.guild.members.fetch(newVal));
  }

  getChannel(channelId) {
    let newVal = channelId.substring(2, channelId.length - 1);
    return Promise.resolve(this.guild.channels.cache.find(channel => channel.id === newVal));
  }
}