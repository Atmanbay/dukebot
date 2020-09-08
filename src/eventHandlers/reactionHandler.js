export default class MessageHandler {
  constructor(container) {
    this.event = 'messageReactionAdd';
    this.loggerService = container.loggerService;
    this.guildService = container.guildService;
    this.permissionsService = container.permissionsService;
    this.configService = container.configService;
    this.twitterService = container.twitterService;
  }

  async handle(messageReaction, user) {
    // Only respond to event if it occurred in the guild this handler is responsible for
    if (!this.guildService.isThisGuild(messageReaction.message.channel.guild)) {
      return;
    }

    try {
      if (!this.configService.useTwitter) {
        return;
      }
  
      let guildMember = await this.guildService.getUser(user.id);
      if (!this.permissionsService.hasTwitterRole(guildMember)) {
        return;
      }
  
      let twitterReactionEmoji = this.configService.emojis.twitter;
      if (twitterReactionEmoji !== messageReaction.emoji.name) {
        return;
      }
  
      let filterUser = async function(user) {
        let guildMember = await this.guildService.getUser(user.id);
        return this.permissionsService.hasTwitterRole(guildMember);
      };

      let reactedUserCount = messageReaction.users.cache.filter(filterUser.bind(this)).size;
      let twitterRoleUserCount = this.guildService.getRole(this.configService.roles.twitter).members.size;
      let divided = twitterRoleUserCount / reactedUserCount;
      if (!divided || divided > 2) {
        return;
      }

      this.twitterService
        .tweet(messageReaction.message.content)
        .then(response => {
          messageReaction.message.channel.send(`https://twitter.com/${response.user.screen_name}/status/${response.id_str}`);
        })
        .catch(error => {
          this.loggerService.error(error);
        });
    } catch (error) {
      this.loggerService.error(error);
    }
  }
}