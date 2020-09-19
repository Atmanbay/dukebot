// Wrapper for guild-related logic
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
      return null;
    }
    
    return this.guild.members.cache.find(user => user.id === userId);
  }

  getChannels(type) {
    if (type) {
      return this.guild.channels.cache.filter(c => c.type === type);
    } 
    
    return this.guild.channels.cache;
  }

  getChannelById(channelId) {
    if (!this.guild.channels) {
      return null;
    }

    return this.guild.channels.cache.find(channel => channel.id === channelId);
  }

  getChannelByName(name) {
    if (!this.guild.channels) {
      return null;
    }

    return this.guild.channels.cache.find(channel => channel.name === name);
  }

  getRole(roleName) {
    return this.guild.roles.cache.find(role => role.name === roleName);
  }
}