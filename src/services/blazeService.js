import moment from 'moment';
import { isEmpty } from 'lodash';

export default class BlazeService {
  constructor(container) {
    this.db = container.databaseService.get('blazes');
    this.guildService = container.guildService;
    this.loggerService = container.loggerService;
    this.dateFormat = 'YYYY-MM-DD hh:mm a';
  }

  isBlazingMinute() {
    let currentTime = moment();
    if (!(currentTime.minute() === 20 && (currentTime.hour() === 4 || currentTime.hour() === 16))) {
      return false;
    }

    return true;
  }

  // Tries to save blaze. Returns false if user already blazed during the current Blazing Minute
  trySaveBlaze(user) {
    let currentTime = moment();
    let dbUser = this.db.find({ id: user.id });
    if (isEmpty(dbUser.value())) {
      this.db
        .push({
          id: user.id,
          timestamps: []
        })
        .write();
      
      dbUser = this.db.find({ id: user.id });
    } else {
      let timestamps = dbUser.value().timestamps;
      let lastBlaze = timestamps[timestamps.length - 1];
      if (lastBlaze === currentTime.format(this.dateFormat)) {
        return false;
      }
    }

    dbUser
      .update(`timestamps`, (timestamps) => {
        timestamps.push(currentTime.format(this.dateFormat));
        return timestamps;
      })
      .write();

    return true;
  }

  // Get all blazes that happened after specified cutoff date
  getBlazes(cutoff) {
    let promises = [];
    let dateFormat = this.dateFormat;
    this.db.value().forEach((entry) => {
      let promise = this.guildService.getUser(entry.id).then((user) => {
        let name = user.nickname || user.user.username;
        let timestamps = entry.timestamps;
        if (cutoff) {
          timestamps = timestamps.filter(function(timestamp) {
            let momentTimestamp = moment(timestamp, dateFormat);
            return momentTimestamp >= cutoff;
          });
        }
        let count = timestamps.length;
        return [name, count];
      });

      promises.push(promise);
    });

    return Promise.all(promises).then((result) => {
      result.sort(function(first, second) {
        return second[1] - first[1];
      });

      return Promise.resolve(result);
    });
  }
}