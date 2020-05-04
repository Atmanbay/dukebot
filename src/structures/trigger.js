import { defaults } from 'lodash';

export default class Trigger {
  constructor(options) {
    let actual = defaults(options || {}, {
      details: {
        description: '',
      },
      isMatch: this.isMatch,
      execute: this.execute
    });

    this.details = actual.details;
    this.isMatch = actual.isMatch;
    this.execute = actual.execute;
  }

  isMatch(message) { 
    return false;
  }

  execute(message, database) { }
}