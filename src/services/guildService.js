export default class GuildService {
  constructor(container) {
    this.guild = container.guild;
  }

  isThisGuild(guild) {
    if (!guild && this.guild.id === 'dm') {
      return true;
    } else {
      return guild && guild.id && this.guild.id === guild.id
    }
  }

  getUser(userId) {
    if (!this.guild.members) {
      return Promise.reject();
    }
    return Promise.resolve(this.guild.members.cache.find(user => user.id === userId));
  }

  getChannel(channelId) {
    if (!this.guild.channels) {
      return Promise.reject();
    }
    return Promise.resolve(this.guild.channels.cache.find(channel => channel.id === channelId));
  }
}