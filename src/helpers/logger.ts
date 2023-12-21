import winston from "winston";
import config from "./config.js";

let logger: winston.Logger;
if (config.isProduction) {
  let logPath = config.paths.logging;
  let serverId = config.serverId;
  logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({
        filename: `${logPath}/${serverId}.error`,
        level: "error",
      }),
      new winston.transports.File({
        filename: `${logPath}/${serverId}.info`,
        level: "info",
      }),
    ],
  });
} else {
  logger = winston.createLogger({
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

export const logInfo = logger.info;
export const logError = logger.error;
