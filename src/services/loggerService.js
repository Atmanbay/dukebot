import winston from 'winston';
import { merge } from 'lodash';

export default class LoggerService {
  constructor(services) {
    let logPath = services.configService.directories.logging;
    let logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: `${logPath}/error.log`, level: 'error' }),
        new winston.transports.File({ filename: `${logPath}/combined.log` })
      ]
    });

    this.info = logger.info.bind(logger);
    this.log = logger.log.bind(logger);
    this.error = logger.error.bind(logger);
  }

  // info(...args) {
  //   this.logger.info(args);
  // }

  // log(...args) {
  //   this.logger.log(args);
  // }

  // error(...args) {
  //   this.logger.error(args);
  // }
};