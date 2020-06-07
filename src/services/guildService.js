export default class GuildService {
  constructor(container) {
    this.guild = container.guild;
  }

  test() {
    console.log('yes');
  }

  getUser(userId) {
    return Promise.resolve(this.guild.members.cache.find(user => user.id === userId));
  }

  getChannel(channelId) {
    return Promise.resolve(this.guild.channels.cache.find(channel => channel.id === channelId));
  }
}