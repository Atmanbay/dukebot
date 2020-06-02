// import { some } from 'lodash';

export default class ResponseService {
  constructor(container) {
    this.db = container.databaseService.get('responses');
  }

  save(responder) {
    this.delete(responder.trigger);
    this.db.push(responder).write();
  }

  delete(trigger) {
    this.db.remove({ trigger: trigger }).write();
  }

  getResponder(messageContent) {
    let lowerContent = messageContent.toLowerCase();
    let responder = this.db.find(function(responder) {
      let regex = new RegExp(`\\b${responder.trigger.toLowerCase()}\\b`);
      return lowerContent.match(regex);
    });

    return responder.value();
  }
}