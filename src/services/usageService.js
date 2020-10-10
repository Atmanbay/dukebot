import { isEmpty } from 'lodash';

export default class UsageService {
  constructor(container) {
    this.db = container.databaseService.get('commandUsage');
    this.loggerService = container.loggerService;
  }

  getCounts() {
    return this.db.value();
  }

  logCommandUse(commandName) {
    let command = this.db.find({ name: commandName });
    if (isEmpty(command.value())) {
      this.db
        .push({
          name: commandName,
          usageCount: 0
        })
        .write();
      
      command = this.db.find({ name: commandName });
    }

    command
      .update('usageCount', usageCount => usageCount + 1)
      .write();
  }
}