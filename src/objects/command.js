import { defaults } from 'lodash';

export default class Command {
  constructor(options) {
    let actual = defaults(options || {}, {
      details: {
        name: '',
        description: '',
        args: []
      }
    });

    this.details = actual.details;
  }

  isMatch(commandWord) {
    return this.details.name === commandWord;
  }

  execute(message, args) {
  }
}