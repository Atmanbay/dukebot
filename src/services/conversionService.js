import LoggerService from './loggerService';

export default class ConversionService {
  constructor(services) {
    this.loggerService = services.loggerService;
    this.guild = services.guild;
  }

  convert(value) {
    let guild = this.guild;
    return new Promise(function(resolve, reject) {
      if (value.startsWith('<@!')) { //value is user
        let newVal = value.substring(3, value.length - 1);
        resolve(guild.members.fetch(newVal));
      } else if (value.startsWith('<#')) { //value is channel
        let newVal = value.substring(2, value.length - 1);
        resolve(guild.channels.cache.find(channel => channel.id === newVal));
      } else {
        resolve(value);
      }
    });
  }
}