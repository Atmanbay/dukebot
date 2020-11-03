import { some } from "lodash";

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
    let channel = messageReaction.message.channel;
    let content = messageReaction.message.content;

    // If message is a link to a Tweet we handle it differently
    let regex = /^https?:\/\/twitter.com\/(.*?)\/status\/(.*?)$/;
    let match = content.match(regex);

    let replyTarget = this.twitterService.getReplyTarget();
    if (replyTarget) {
      this.twitterService.setReplyTarget(null);

      // You have to @ them otherwise it won't actually reply
      return this.twitterService
        .tweet(`@${replyTarget.name} ${content}`, replyTarget.tweetId)
        .then((response) => {
          channel.send(
            `https://twitter.com/${response.data.user.screen_name}/status/${response.data.id_str}`
          );
        })
        .catch(this.loggerService.error);
    }

    if (!match) {
      return this.twitterService
        .tweet(content)
        .then((response) => {
          channel.send(
            `https://twitter.com/${response.data.user.screen_name}/status/${response.data.id_str}`
          );
        })
        .catch(this.loggerService.error);
    }

    let name = match[1];
    let tweetId = match[2];

    // Check if message has been reacted to with the retweet or reply emojis
    let reactions = messageReaction.message.reactions.cache.map(
      (r) => r.emoji.name
    );

    let retweetEmoji = some(reactions, (reaction) => {
      return reaction == this.configService.emojis.retweet;
    });

    let replyEmoji = some(reactions, (reaction) => {
      return reaction == this.configService.emojis.reply;
    });

    if (retweetEmoji && replyEmoji) {
      channel.send(
        "Message was reacted with retweet and reply so cannot handle"
      );
    } else if (retweetEmoji) {
      return this.twitterService
        .retweet(tweetId)
        .then((response) => {
          channel.send(
            `https://twitter.com/${response.data.user.screen_name}/status/${response.data.id_str}`
          );
        })
        .catch(this.loggerService.error);
    } else if (replyEmoji) {
      this.twitterService.setReplyTarget({
        name: name,
        tweetId: tweetId,
      });

      channel.send(`The next tweet will be a reply to ${name}'s tweet`);
    }
  }
}
