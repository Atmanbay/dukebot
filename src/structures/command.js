import { defaults } from 'lodash';

export default class Command {
  constructor(options) {
    let actual = defaults(options || {}, {
      details: {
        name: '',
        description: '',
        args: []
      },
      isMatch: this.isMatch,
      execute: this.execute
    });

    this.details = actual.details;
    this.isMatch = actual.isMatch;
    this.execute = actual.execute;
  }

  isMatch(commandWord) {
    return this.details.name === commandWord;
  }

  execute(message, args, database) { }
}