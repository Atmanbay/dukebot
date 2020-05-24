import fs from 'fs';
import config from '../config.json';
import Bot from './bot/bot';
import InjectionManager from './structures/injectionManager';

function main() {
  let injectionManager = new InjectionManager();
  let services = injectionManager.build();

  let dukeBot = new Bot(services);

  let eventHandlers = services.resolve('loaderService').load(`${__dirname}/eventHandlers`);
  eventHandlers.forEach((handler) => {
    dukeBot.registerHandler(new handler(services));
  });

  dukeBot.start();
}

main();