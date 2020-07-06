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
    this.dbDefaults = {
      "jobs": [
      ],
      "blazes": [
      ],
      "messages": [
      ],
      "responses": [
      ],
      "walkups": [
      ]
    }
  }

  getEnvironmentVariable(name) {
    let value = process.env[name];
    if (!value)
        throw(`Environment variable ${name} is not set`);

    return value;
  }
}