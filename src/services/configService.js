import dbDefaults from '../../config/dbDefaults';

export default class ConfigService {
  constructor() {
    this.isProduction = this.getEnvironmentVariable('NODE_ENV') === 'production';
    if (this.isProduction) {
      this.prefix = this.getEnvironmentVariable('DUKE_COMMAND_PREFIX');
      this.paths = {
          'audio': this.getEnvironmentVariable('DUKE_AUDIO_PATH'),
          'database': this.getEnvironmentVariable('DUKE_DATABASE_PATH'),
          'logging': this.getEnvironmentVariable('DUKE_LOGGING_PATH')
      }
    } else {
      this.prefix = this.getEnvironmentVariable('DUKE_DEV_COMMAND_PREFIX');
      this.paths = {
            'audio': this.getEnvironmentVariable('DUKE_DEV_AUDIO_PATH'),
            'database': this.getEnvironmentVariable('DUKE_DEV_DATABASE_PATH'),
            'logging': this.getEnvironmentVariable('DUKE_DEV_LOGGING_PATH')
        }
    }

    this.token = this.getEnvironmentVariable('DUKE_DISCORD_TOKEN');
    this.messageCount = this.getEnvironmentVariable('DUKE_MESSAGE_HISTORY_COUNT');
    this.dbDefaults = dbDefaults;

    this.emojis = {
      goodJob: this.getEnvironmentVariable('DUKE_EMOJIS_GOOD_JOB'),
      badJob: this.getEnvironmentVariable('DUKE_EMOJIS_BAD_JOB')
    };

    this.roles = {
      admin: this.getEnvironmentVariable('DUKE_ROLES_ADMIN')
    }

    this.useTwitter = 'true' == this.getEnvironmentVariable('DUKE_USE_TWITTER').toLowerCase();
    if (this.useTwitter) {
      this.twitter = {
        consumerKey: this.getEnvironmentVariable('DUKE_TWITTER_CONSUMER_KEY'),
        consumerSecret: this.getEnvironmentVariable('DUKE_TWITTER_CONSUMER_SECRET'),
        accessTokenKey: this.getEnvironmentVariable('DUKE_TWITTER_ACCESS_TOKEN_KEY'),
        accessTokenSecret: this.getEnvironmentVariable('DUKE_TWITTER_ACCESS_TOKEN_SECRET')
      }

      this.emojis.twitter = this.getEnvironmentVariable('DUKE_EMOJIS_TWITTER');
      this.roles.twitter = this.getEnvironmentVariable('DUKE_ROLES_TWITTER');
    }

    this.useStocks = 'true' == this.getEnvironmentVariable('DUKE_USE_STOCKS').toLowerCase();
    if (this.useStocks) {
      this.stocks = {
        username: this.getEnvironmentVariable('DUKE_STOCKS_USER'),
        password: this.getEnvironmentVariable('DUKE_STOCKS_PW'),
        contestId: this.getEnvironmentVariable('DUKE_STOCKS_CONTEST_ID')
      }
    }
  }

  getEnvironmentVariable(name) {
    let value = process.env[name];
    if (!value)
        throw(`Environment variable ${name} is not set`);

    return value;
  }
}