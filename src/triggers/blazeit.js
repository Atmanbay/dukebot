import Trigger from '../structures/trigger';
import moment from 'moment';
import { isEmpty } from 'lodash';

export default class BlazeItTrigger extends Trigger {
  constructor(services) {
    super();
    this.blazeService = services.blazeService;
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

    let dateFormat = 'YYYY-MM-DD hh:mm a';
    let user = message.author;
    let db = database.get('blazes');
    let dbUser = db.find({ id: user.id });
    if (isEmpty(dbUser.value())) {
      db
        .push({
          id: user.id,
          timestamps: []
        })
        .write();
      
      dbUser = db.find({ id: user.id });
    } else {
      let timestamps = dbUser.value().timestamps;
      let lastBlaze = timestamps[timestamps.length - 1];
      if (lastBlaze === currentTime.format(dateFormat)) {
        return;
      }
    }

    dbUser
      .update(`timestamps`, (timestamps) => {
        timestamps.push(currentTime.format(dateFormat));
        return timestamps;
      })
      .write();
  }
}