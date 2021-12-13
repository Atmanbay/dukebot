module.exports = class {
  constructor(services) {
    this.loggingService = services.logging;
    this.guildService = services.guild;
  }

  async getUser(userId) {
    let newVal = userId;
    if (userId.startsWith("<")) {
      newVal = userId.substring(3, userId.length - 1);
    }

    return this.guildService.getUser(newVal);
  }

  getChannelById(channelId) {
    let newVal = channelId.substring(2, channelId.length - 1);
    return this.guildService.getChannelById(newVal);
  }

  getChannelByName(name) {
    return this.guildService.getChannelByName(name);
  }
};
