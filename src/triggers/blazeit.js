import Trigger from '../objects/trigger';

export default class BlazeItTrigger extends Trigger {
  constructor(container) {
    super();
    this.blazeService = container.blazeService;
    this.details = {
      description: 'Trigger command to count blaze its at 4:20 AM and PM',
    };
  }

  isMatch(message) {
    return message.content.toLowerCase().includes('blaze it');
  }

  execute(message) {
    this.blazeService.saveBlaze(message.author);
  }
}