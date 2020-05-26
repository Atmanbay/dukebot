import Bot from './bot/bot';
import ServiceManager from './structures/serviceManager';

function main() {
  let dukeBot = new Bot();
  dukeBot.start();
}

main();