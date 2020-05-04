import Database from './database';
import Bot from './bot/bot';
import EventHandlers from './eventHandlers';

let database = new Database();
let token = database.config.find({ key: "token" });

let dukeBot = new Bot();

EventHandlers.forEach((handler) => {
  dukeBot.registerHandler(new handler.default(database.config));
})

dukeBot.start(token.value().value);