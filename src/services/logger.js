import winston from "winston";

export default class {
  constructor(services) {
    let logger = {};
    if (services.config.isProduction) {
      let logPath = services.config.paths.logging;
      let guildId = services.guild.guild.id;
      logger = winston.createLogger({
        level: "info",
        format: winston.format.combine(
          winston.format.errors({ stack: true }),
          winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
          }),
          winston.format.json()
        ),
        transports: [
          new winston.transports.File({
            filename: `${logPath}/${guildId}.error`,
            level: "error",
          }),
          new winston.transports.File({
            filename: `${logPath}/${guildId}.log`,
            level: "info",
          }),
        ],
      });
    } else {
      logger = winston.createLogger({
        level: "info",
        format: winston.format.combine(
          winston.format.errors({ stack: true }),
          winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
          }),
          winston.format.json()
        ),
        transports: [
          new winston.transports.Console({ level: "error" }),
          new winston.transports.Console({ level: "info" }),
        ],
      });
    }

    // Binds info, log, and error methods to self
    this.info = logger.info.bind(logger);
    this.log = logger.log.bind(logger);
    this.error = logger.error.bind(logger);
  }
}
