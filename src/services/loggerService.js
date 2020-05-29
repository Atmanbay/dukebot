import winston from 'winston';
import { merge } from 'lodash';

export default class LoggerService {
  constructor(container) {
    let logPath = container.configService.directories.logging;
    let guild = container.guild;
    let logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: `${logPath}/error_${guild.id}.log`, level: 'error' }),
        new winston.transports.File({ filename: `${logPath}/combined_${guild.id}.log` })
      ]
    });

    this.info = logger.info.bind(logger);
    this.log = logger.log.bind(logger);
    this.error = logger.error.bind(logger);
  }
};