import { filter, isEmpty } from "lodash";

export default class {
  constructor(services) {
    this.loggingService = services.logging;

    let handlers = services.file.getClasses("./*.handler.js", __dirname);

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
        this.loggingService.error(
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
