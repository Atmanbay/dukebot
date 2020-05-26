export default class BlazeService {
  constructor(services) {
    this.db = services.databaseService.get('blazes');
    this.guildMembers = services.guild.members;
    this.loggerService = services.loggerService;
  }

  saveBlaze() {

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