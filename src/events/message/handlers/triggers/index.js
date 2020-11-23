import { filter, isEmpty } from "lodash";

export default class {
  constructor(services) {
    this.loggerService = services.logger;

    let handlers = services.file.getClasses("handlers/*.js", __dirname);

    this.triggers = Object.values(handlers);
  }

  handle(message) {
    let triggers = this.getTriggers(message);
    if (isEmpty(triggers)) {
      return;
    }

    triggers.forEach((trigger) => {
      try {
        trigger.execute(message);
      } catch (error) {
        this.loggerService.error(
          "Error when trying to execute trigger",
          message.author.id,
          message.content
        );
      }
    });
  }

  getTriggers(message) {
    return filter(this.triggers, (trigger) => {
      return trigger.isMatch(message);
    });
  }
}
