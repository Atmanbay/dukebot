import Twitter from "twit";

export default class {
  constructor(services) {
    this.configService = services.config;
    if (!this.configService.useTwitter) {
      return;
    }

    this.client = new Twitter({
      consumer_key: this.configService.twitter.consumerKey,
      consumer_secret: this.configService.twitter.consumerSecret,
      access_token: this.configService.twitter.accessTokenKey,
      access_token_secret: this.configService.twitter.accessTokenSecret,
    });

    this.replyTarget = null;

    this.db = services.database.get("twitter");
    this.loggingService = services.logging;
    this.streams = {};

    if (!this.configService.isProduction) {
      return;
    }

    this.db.value().forEach((entry) => {
      let channel = services.guild.getChannelById(entry.channelId);
      let callback = (tweet) => {
        if (!channel) {
          this.loggingService.info(
            `No channel to send tweet by ${tweet.user.screen_name}`
          );
          return;
        }
        let url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
        channel.send(url);
      };

      this.subscribe(entry.userId, entry.options, callback);
    });
  }

  async tweet(status, tweetId) {
    if (!this.configService.useTwitter) {
      return;
    }

    let options = {
      status: status,
    };

    if (tweetId) {
      options.in_reply_to_status_id = tweetId;
    }

    return this.client.post("statuses/update", options);
  }

  async retweet(tweetId) {
    if (!this.configService.useTwitter) {
      return;
    }
    return this.client.post(`statuses/retweet/${tweetId}`, {});
  }

  async getUserId(username) {
    let user = await this.client.get("users/show", {
      screen_name: username,
    });

    return user.data.id_str;
  }

  async subscribe(userId, options, callback) {
    if (userId in this.streams) {
      await this.unsubscribe(userId);
      delete this.streams[userId];
    }

    let stream = this.client.stream("statuses/filter", {
      follow: [userId],
    });

    stream.on("tweet", (tweet) => {
      if (tweet.user.id_str !== userId) {
        return;
      }

      if (options.includeReplies !== false && tweet.in_reply_to_status_id) {
        return;
      }

      callback(tweet);
    });

    this.streams[userId] = stream;

    this.loggingService.info(`Subscribed to ${userId}`);
  }

  save(userId, options, channelId) {
    this.db
      .push({
        userId: userId,
        channelId: channelId,
        options: options,
      })
      .write();
  }

  async unsubscribe(userId) {
    let stream = this.streams[userId];
    if (!stream) {
      return;
    }

    stream.stop();

    this.db.remove({ userId: userId }).write();
    delete this.streams[userId];

    this.loggingService.info(`Unsubscribed to ${userId}`);
  }

  setReplyTarget(replyTarget) {
    this.replyTarget = replyTarget;
  }

  getReplyTarget() {
    return this.replyTarget;
  }
}
