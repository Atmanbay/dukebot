import { defaults } from 'lodash';

export default class Command {
  isMatch(commandWord) {
    return this.details.name === commandWord;
  }

  execute(message, args) { }

  setContext(context) {
    this.context = context;
  }
}