import { filter, isEmpty } from 'lodash';

export default class CommandService {
  constructor(services) {
    this.databaseService = services.databaseService;
    this.loggerService = services.loggerService;
    this.load(services);
  }

  load(services) {
    this.triggers = [];
    services.loaderService.load(`${__dirname}/../triggers`).forEach((trigger) => {
      this.triggers.push(new trigger(services));
    });
  }

  handle(message) {
    let triggers = this.getTriggers(message);
    if (isEmpty(triggers)) {
      return;
    }

    let database = this.databaseService.get(message.guild.id);
    triggers.forEach((trigger) => {
      try {
        trigger.execute(message, database);  
      } catch (error) {
        this.loggerService.error('Error when trying to execute trigger', message.author.id, message.content); 
      }
    });
  }

  getTriggers(message) {
    return filter(this.triggers, (trigger) => {
      return trigger.isMatch(message);
    });
  }
}