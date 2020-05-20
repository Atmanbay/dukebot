import { defaults } from 'lodash';

export default class Trigger {
  isMatch(message) { 
    return false;
  }

  execute(message, database) { }
}