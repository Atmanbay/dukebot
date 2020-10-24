export default class TwitterEmojiReactionHandler {
  // Handles the detection + execution of tweeting
  constructor(container) {
    this.loggerService = container.loggerService;
    this.guildService = container.guildService;
    this.permissionsService = container.permissionsService;
    this.configService = container.configService;
    this.twitterService = container.twitterService;
  }

  shouldHandle(messageReaction, user) {
    if (!this.configService.useTwitter) {
      return false;
    }

    let twitterReactionEmoji = this.configService.emojis.twitter;
    if (twitterReactionEmoji !== messageReaction.emoji.name) {
      return false;
    }

    let guildMember = this.guildService.getUser(user.id);
    if (!this.permissionsService.hasTwitterRole(guildMember)) {
      return false;
    }

    let filterUser = async function (user) {
      let guildMember = this.guildService.getUser(user.id);
      return this.permissionsService.hasTwitterRole(guildMember);
    };

    let reactedUserCount = messageReaction.users.cache.filter(
      filterUser.bind(this)
    ).size;
    let twitterRoleUserCount = this.guildService.getRole(
      this.configService.roles.twitter
    ).members.size;
    let divided = twitterRoleUserCount / reactedUserCount;
    if (!divided || divided > 2) {
      return false;
    }

    return true;
  }

  handle(messageReaction) {
    this.twitterService
      .tweet(messageReaction.message.content)
      .then((response) => {
        messageReaction.message.channel.send(
          `https://twitter.com/${response.user.screen_name}/status/${response.id_str}`
        );
      })
      .catch((error) => {
        this.loggerService.error(error);
      });
  }
}
