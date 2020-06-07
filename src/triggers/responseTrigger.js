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
    let response = this.responseService.getResponder(message.content);
    if (response.response) {
      message.channel.send(response.response);
    } else if (response.emojiReaction) {
      message.react(response.emojiReaction);
    }
  }
}