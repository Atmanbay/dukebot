import fs from 'fs';
import config from '../config.json';
import Bot from './bot/bot';
import LoaderService from './services/loaderService';
import LoggerService from './services/loggerService';
import DatabaseService from './services/databaseService';

function main() {
  let loggerService = new LoggerService();
  let databaseService = new DatabaseService();

  let token = getToken(config.tokenPath);
  let dukeBotOptions = {
    token: token,
    loggerService: loggerService,
    databaseService: databaseService
  };
  
  let dukeBot = new Bot(dukeBotOptions);

  let eventHandlerOptions = {
    prefix: config.prefix,
    loggerService: loggerService,
    databaseService: databaseService
  }

  let eventHandlers = LoaderService.load(`${__dirname}/eventHandlers`);
  eventHandlers.forEach((handler) => {
    dukeBot.registerHandler(new handler(eventHandlerOptions));
  });

  dukeBot.start();
}

function getToken(tokenPath) {
  return fs.readFileSync(tokenPath, {encoding: 'utf8'});
}

main();