import Twitter from "twit";

export default class TwitterService {
  constructor(container) {
    this.configService = container.configService;
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
      console.log("not using twitter");
      return;
    }
    console.log(tweetId);
    return this.client.post(`statuses/retweet/${tweetId}`, {});
  }

  setReplyTarget(replyTarget) {
    this.replyTarget = replyTarget;
  }

  getReplyTarget() {
    return this.replyTarget;
  }
}
