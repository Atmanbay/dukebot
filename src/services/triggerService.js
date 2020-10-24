import { filter, isEmpty } from "lodash";

export default class CommandService {
  constructor(container) {
    this.loggerService = container.loggerService;
    this.triggers = container.triggers;
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
