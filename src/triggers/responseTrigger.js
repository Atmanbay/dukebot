import Trigger from '../objects/trigger';

export default class ResponseTrigger extends Trigger {
  constructor(container) {
    super();
    this.responseService = container.responseService;
    this.details = {
      description: 'Trigger that handles custom responses',
    };
  }

  isMatch(message) {
    return this.responseService.getResponder(message.content);
  }

  execute(message) {
    message.channel.send(this.responseService.getResponder(message.content).response);
  }
}