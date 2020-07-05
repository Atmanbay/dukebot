import Command from '../objects/command';
import emojiRegex from 'emoji-regex';
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
          description: 'Word/phrase/emoji that the bot will respond with',
          optional: true
        },
        {
          name: 'delete',
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

    if (args.delete) {
      this.responseService.delete(args.t);
      return;
    }

    let responses = [];
    if (Array.isArray(args.r)) {
      responses = args.r.map(this.parseResponse);
    } else {
      responses.push(this.parseResponse(args.r));
    }

    this.responseService.save({
      trigger: args.t,
      responses: responses
    });
    
    message.react('👌');  
  }

  parseResponse(value) {
    let response = {};

    let isEmoji = emojiRegex();
    let emojiMatch = isEmoji.exec(value);
    if (emojiMatch) {
      let emoji = emojiMatch[0];
      response.value = emoji;
      response.type = 'emoji';
      return response;
    }

    let isCustomEmoji = RegExp('\<:(.*?):(.*?)\>');
    let customEmojiMatch = value.match(isCustomEmoji);
    if (customEmojiMatch) {
      let customEmojiId = customEmojiMatch[2];
      response.value = customEmojiId;
      response.type = 'customEmoji';
      return response;
    }

    if (typeof value === 'string') {
      response.value = value;
      response.type = 'string';
      return response;
    }

    return { };
  }
}