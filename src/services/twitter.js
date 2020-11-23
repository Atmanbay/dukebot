import Twitter from "twit";
import { find, pull } from "lodash";

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
    this.streams = [];
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

  async subscribe(username, callback) {
    let user = await this.client.get("users/show", {
      screen_name: username,
    });

    let userId = user.data.id_str;
    let stream = this.client.stream("statuses/filter", {
      follow: [userId],
    });

    stream.on("tweet", (tweet) => {
      if (tweet.user.id_str !== userId) {
        return;
      }

      callback(tweet);
    });

    this.streams.push({
      username,
      stream,
    });
  }

  async unsubscribe(username) {
    let streamEntry = find(this.streams, (s) => {
      return s.username === username;
    });

    if (!streamEntry) {
      return;
    }

    pull(this.streams, streamEntry);

    streamEntry.stream.stop();
  }

  setReplyTarget(replyTarget) {
    this.replyTarget = replyTarget;
  }

  getReplyTarget() {
    return this.replyTarget;
  }
}
