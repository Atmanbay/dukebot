import Database from './database';
import Bot from './bot/bot';
import EventHandlers from './eventHandlers';

function main() {
  let token = Database.get('config').find({ key: "token" }).value();
  if (!token || !token.value) {
    console.error('Please supply a token value in database/db.json');
    return;
  }

  let dukeBot = new Bot();

  EventHandlers.forEach((handler) => {
    dukeBot.registerHandler(new handler.default(Database.get('config')));
  })

  dukeBot.start(token.value);
}

main();