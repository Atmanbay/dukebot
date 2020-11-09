import moment from "moment-timezone";
import { isEmpty } from "lodash";

export default class BlazeService {
  constructor(container) {
    this.db = container.databaseService.get("blazes");
    this.guildService = container.guildService;
    this.loggerService = container.loggerService;
    this.dateFormat = "YYYY-MM-DD hh:mm a";
  }

  isBlazingMinute(time) {
    let currentTime = moment.utc(time).tz("America/New_York");
    if (
      !(
        currentTime.minute() === 20 &&
        (currentTime.hour() === 4 || currentTime.hour() === 16)
      )
    ) {
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
          timestamps: [],
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

  // Get all blazes that happened between start and end dates
  async getBlazes(start, end) {
    let dateFormat = this.dateFormat;
    let db = this.db.value();
    let promises = db.map(async (entry) => {
      let guildUser = await this.guildService.getUser(entry.id);
      let name = guildUser.nickname || guildUser.user.username;
      let timestamps = entry.timestamps;
      if (start && end) {
        timestamps = timestamps.filter(function (timestamp) {
          let momentTimestamp = moment(timestamp, dateFormat);
          return momentTimestamp >= start && momentTimestamp <= end;
        });
      }
      let count = timestamps.length;
      return [name, count];
    });

    let result = await Promise.all(promises);
    result.sort(function (first, second) {
      return second[1] - first[1];
    });

    result = result.filter((b) => b[1] > 0);

    return result;
  }
}
