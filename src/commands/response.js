import Command from '../objects/command';
import { isEmpty } from 'lodash';

export default class ResponseCommand extends Command {
  constructor(container) {
    super();
    this.responseService = container.responseService;
    this.details = {
      name: 'response',
      description: 'Add a custom responder to the bot',
      args: [
        {
          name: 't',
          description: 'Word/phrase that will trigger the response',
          optional: false
        },
        {
          name: 'r',
          description: 'Word/phrase that the bot will respond with',
          optional: true
        },
        {
          name: 'd',
          description: 'Flag to tell bot to delete specified trigger',
          optional: true
        }
      ]
    };
  }

  execute(message, args) {
    if (!args.t) {
      return;
    }

    if (args.r && !isEmpty(args.r)) {
      let responder = {
        trigger: args.t,
        response: args.r
      };
  
      this.responseService.save(responder);
    } else if (args.d) {
      this.responseService.delete(args.t);
    }    
  }
}