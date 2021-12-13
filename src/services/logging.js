const winston = require("winston");

module.exports = class {
  constructor(services) {
    let logging = {};
    if (services.config.isProduction) {
      let logPath = services.config.paths.logging;
      let guildId = services.guild.guild.id;
      logging = winston.createLogger({
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
      logging = winston.createLogger({
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
    this.info = logging.info.bind(logging);
    this.log = logging.log.bind(logging);
    this.error = logging.error.bind(logging);
  }
};
