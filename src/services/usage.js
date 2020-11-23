import { isEmpty } from "lodash";

export default class {
  constructor(services) {
    this.db = services.database.get("commandUsage");
    this.loggerService = services.logger;
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
          usageCount: 0,
        })
        .write();

      command = this.db.find({ name: commandName });
    }

    command.update("usageCount", (usageCount) => usageCount + 1).write();
  }
}
