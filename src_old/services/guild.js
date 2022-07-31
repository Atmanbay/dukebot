// Wrapper for guild-related logic
module.exports = class {
  constructor(services) {
    this.guild = services.values.guild;
    this.configService = services.config;
  }

  isDm() {
    return this.guild.id === "dm";
  }

  isThisGuild(guildId) {
    return this.guild.id === guildId;
  }

  async getUser(userId) {
    if (!this.guild.members) {
      return null;
    }

    return this.guild.members.fetch(userId).catch(() => null);
  }

  getChannels(type) {
    if (type) {
      return this.guild.channels.cache.filter((c) => c.type === type);
    }

    return this.guild.channels.cache;
  }

  getChannelById(channelId) {
    if (!this.guild.channels) {
      return null;
    }

    return this.guild.channels.cache.find(
      (channel) => channel.id === channelId
    );
  }

  getChannelByName(name) {
    if (!this.guild.channels) {
      return null;
    }

    return this.guild.channels.cache.find((channel) => channel.name === name);
  }

  getRole(roleName) {
    return this.guild.roles.cache.find((role) => role.name === roleName);
  }

  deleteEmoji(name) {
    let cleanedName = name.replace(/[^A-za-z]/g, "");
    let emoji = this.guild.emojis.cache.find(
      (emoji) => emoji.name === cleanedName
    );

    if (emoji) {
      emoji.delete();
    }
  }

  addAviEmoji(userId, avatarId, name) {
    let cleanedName = name.replace(/[^A-za-z]/g, "");
    let url = `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.png`;
    this.addEmoji(url, cleanedName);
  }

  addEmoji(path, name) {
    let emoji = this.guild.emojis.cache.find((emoji) => emoji.name === name);

    if (!emoji) {
      this.guild.emojis.create(path, name);
    }
  }
};
