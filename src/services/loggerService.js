import winston from 'winston';

export default class LoggerService {
  constructor(container) {
    let logPath = container.configService.directories.logging;
    let guildId = container.guildService.guild.id;
    let logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: `${logPath}/error_${guildId}.log`, level: 'error' }),
        new winston.transports.File({ filename: `${logPath}/combined_${guildId}.log` })
      ]
    });

    // Binds info, log, and error methods to self
    this.info = logger.info.bind(logger);
    this.log = logger.log.bind(logger);
    this.error = logger.error.bind(logger);
  }
};