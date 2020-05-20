import Trigger from '../structures/trigger';
import moment from 'moment';
import { isEmpty } from 'lodash';

export default class BlazeItTrigger extends Trigger {
  constructor() {
    super();
    this.details = {
      description: 'Trigger command to count blaze its at 4:20 AM and PM',
    };
  }

  isMatch(message) {
    return message.content.toLowerCase().includes('blaze it');
  }

  execute(message, database) {
    let currentTime = moment();
    if (!(currentTime.minute() === 20 && (currentTime.hour() === 4 || currentTime.hour() === 16))) {
      return;
    }

    let user = message.author;
    let db = database.get('blazes');
    let dbUser = db.find({ id: user.id });
    if (isEmpty(dbUser.value())) {
      db
        .push({
          id: user.id,
          count: 0
        })
        .write();
    }

    dbUser
      .update(`count`, count => count + 1)
      .write();  
  }
}