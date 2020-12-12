import dbDefaults from "../../config/dbDefaults";

export default class {
  constructor() {
    this.isProduction =
      this.getEnvironmentVariable("NODE_ENV") === "production";

    this.prefix = this.getEnvironmentVariable("COMMAND_PREFIX");
    this.paths = {
      audio: this.getEnvironmentVariable("AUDIO_PATH"),
      database: this.getEnvironmentVariable("DATABASE_PATH"),
      logging: this.getEnvironmentVariable("LOGGING_PATH"),
    };

    this.token = this.getEnvironmentVariable("DISCORD_TOKEN");
    this.messageCount = this.getEnvironmentVariable("MESSAGE_HISTORY_COUNT");
    this.dbDefaults = dbDefaults;

    this.emojis = {
      goodJob: this.getEnvironmentVariable("EMOJIS_GOOD_JOB"),
      badJob: this.getEnvironmentVariable("EMOJIS_BAD_JOB"),
      retweet: this.getEnvironmentVariable("EMOJIS_RETWEET"),
      reply: this.getEnvironmentVariable("EMOJIS_REPLY"),
    };

    this.roles = {
      admin: this.getEnvironmentVariable("ROLES_ADMIN"),
    };

    this.currency = {
      beginningBalance: this.getEnvironmentVariable("BEGINNING_BALANCE"),
      jobToDukes: this.getEnvironmentVariable("JOB_TO_DUKES"),
    };

    this.useTwitter =
      "true" == this.getEnvironmentVariable("USE_TWITTER").toLowerCase();
    if (this.useTwitter) {
      this.twitter = {
        consumerKey: this.getEnvironmentVariable("TWITTER_CONSUMER_KEY"),
        consumerSecret: this.getEnvironmentVariable("TWITTER_CONSUMER_SECRET"),
        accessTokenKey: this.getEnvironmentVariable("TWITTER_ACCESS_TOKEN_KEY"),
        accessTokenSecret: this.getEnvironmentVariable(
          "TWITTER_ACCESS_TOKEN_SECRET"
        ),
      };

      this.emojis.twitter = this.getEnvironmentVariable("EMOJIS_TWITTER");
      this.roles.twitter = this.getEnvironmentVariable("ROLES_TWITTER");
    }

    this.useStocks =
      "true" == this.getEnvironmentVariable("USE_STOCKS").toLowerCase();
    if (this.useStocks) {
      this.stocks = {
        username: this.getEnvironmentVariable("STOCKS_USER"),
        password: this.getEnvironmentVariable("STOCKS_PW"),
        contestId: this.getEnvironmentVariable("STOCKS_CONTEST_ID"),
      };
    }
  }

  getEnvironmentVariable(name) {
    let value = process.env[name];
    if (!value) throw `Environment variable ${name} is not set`;

    return value;
  }
}
