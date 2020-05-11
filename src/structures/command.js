import { defaults } from 'lodash';

export default class Command {
  constructor(options) {
    let actual = defaults(options || {}, {
      name: '',
      isMatch: this.isMatch,
      execute: this.execute
    });

    this.name = actual.name;
    this.isMatch = actual.isMatch;
    this.execute = actual.execute;
  }

  isMatch(msg, commandWord) {
    return this.name === commandWord;
  }

  execute(msg, args) { }
}