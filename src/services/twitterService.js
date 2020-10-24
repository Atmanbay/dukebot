import Twitter from "twitter";

export default class TwitterService {
  constructor(container) {
    this.configService = container.configService;
    if (!this.configService.useTwitter) {
      return;
    }
    this.client = new Twitter({
      consumer_key: this.configService.twitter.consumerKey,
      consumer_secret: this.configService.twitter.consumerSecret,
      access_token_key: this.configService.twitter.accessTokenKey,
      access_token_secret: this.configService.twitter.accessTokenSecret,
    });
  }

  async tweet(status) {
    if (!this.configService.useTwitter) {
      return;
    }

    return this.client.post("statuses/update", { status: status });
  }
}
