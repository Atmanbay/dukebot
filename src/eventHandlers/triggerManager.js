import { find } from 'lodash';
import EventHandler from '../structures/eventHandler';
import DatabaseService from '../services/databaseService';
import LoaderService from '../services/loaderService';

export default class CommandManager extends EventHandler {
  constructor(options) {
    super();
    this.event = 'message';
    this.triggers = [];
    LoaderService.load(`${__dirname}/../triggers`).forEach((trigger) => {
      this.triggers.push(new trigger());
    });

    this.databaseService = options.databaseService || new DatabaseService();
    this.loggerService = options.loggerService || null;
  }

  handle(message) {
    let trigger = this.getTrigger(message);
    if (!trigger) {
      return;
    }

    let database = this.databaseService.get(message.guild.id);
    try {
      trigger.execute(message, database);  
    } catch (error) {
      this.loggerService.error('Error when trying to execute trigger', message.author.id, message.content); 
    }
  }

  getTrigger(message) {
    return find(this.triggers, (trigger) => {
      return trigger.isMatch(message);
    });
  }
}