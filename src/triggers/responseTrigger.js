import Trigger from '../objects/trigger';

export default class ResponseTrigger extends Trigger {
  constructor(container) {
    super();
    this.responseService = container.responseService;
    this.guildService = container.guildService;
    this.details = {
      description: 'Trigger that handles custom responses',
    };
  }

  isMatch(message) {
    return this.responseService.getResponder(message.content);
  }

  execute(message) {
    let response = this.responseService.getResponder(message.content);
    response.responses.forEach((response) => {
      if (response.type === 'string') {
        message.channel.send(response.value);
      } else if (response.type === 'customEmoji') {
        let customEmoji = this.guildService.guild.emojis.resolve(response.value);
        message.react(customEmoji);   
      } else if (response.type === 'emoji') {
        message.react(response.value);
      }
    })
  }
}