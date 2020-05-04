import winston from 'winston';
import config from '../../config.json';

export default class LoggerService {
  constructor() {
    let logPath = config.directories.logging;
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
      ),
      defaultMeta: { service: 'dukebot' },
      transports: [
        new winston.transports.File({ filename: `${logPath}/error.log`, level: 'error' }),
        new winston.transports.File({ filename: `${logPath}/combined.log` })
      ]
    });
  }

  info(...args) {
    this.logger.info(args);
  }

  log(...args) {
    this.logger.log(args);
  }

  error(...args) {
    this.logger.error(args);
  }
};