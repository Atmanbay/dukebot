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
      return;
    }
    return this.client.post(`statuses/retweet/${tweetId}`, {});
  }

  async subscribe(username, callback) {
    try {
      let user = await this.client.get("users/show", {
        screen_name: username,
      });

      let stream = this.client.stream("statuses/filter", {
        follow: [user.data.id_str],
      });

      stream.on("tweet", (tweet) => {
        console.log("tweet is", tweet);
        callback(tweet);
      });

      stream.on("message", (event) => {
        console.log("***** MESSAGE *****", event);
      });
    } catch (error) {
      console.log(error);
    }
  }

  setReplyTarget(replyTarget) {
    this.replyTarget = replyTarget;
  }

  getReplyTarget() {
    return this.replyTarget;
  }
}
