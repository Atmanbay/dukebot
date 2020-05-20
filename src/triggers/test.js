import Trigger from '../structures/trigger';

export default class TestTrigger extends Trigger {
  constructor() {
    super();
    this.details = {
      description: 'Test trigger'
    };
  }

  isMatch(message) {
    return message.content.toLowerCase().includes('trigger test');
  }

  execute(message) {
    message.channel.send('!!!');
  }
}