import Database from './database';
import Bot from './bot/bot';
import EventHandlers from './eventHandlers';

let token = Database.get('config').find({ key: "token" });

let dukeBot = new Bot();

EventHandlers.forEach((handler) => {
  dukeBot.registerHandler(new handler.default(Database.get('config')));
})

dukeBot.start(token.value().value);