import moment from 'moment';
import { isEmpty } from 'lodash';

export default class BlazeService {
  constructor(services) {
    this.db = services.databaseService.get('blazes');
    this.guildMembers = services.guild.members;
    this.loggerService = services.loggerService;
  }

  saveBlaze(user) {
    let currentTime = moment();
    // if (!(currentTime.minute() === 20 && (currentTime.hour() === 4 || currentTime.hour() === 16))) {
    //   return;
    // }

    let dateFormat = 'YYYY-MM-DD hh:mm a';
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

  getBlazes() {
    let promises = [];
    this.db.value().forEach((entry) => {
      let promise = this.guildMembers.fetch(entry.id).then((user) => {
        let name = user.nickname || user.name;
        let count = entry.timestamps.length;
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