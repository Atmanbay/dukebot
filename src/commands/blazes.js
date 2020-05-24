import Command from '../structures/command';

export default class BlazeItCommand extends Command {
  constructor(services) {
    super();
    this.blazeService = services.blazeService;
    this.details = {
      name: 'blazes',
      description: 'Get the sorted leaderboard of blazes',
      args: []
    };
  }

  execute(message, args, database) {
    let guildMembers = message.guild.members;
    let db = database.get('blazes');
    let promises = [];
    db.value().forEach((entry) => {
      let promise = guildMembers.fetch(entry.id).then((user) => {
        let name = user.nickname || user.name;
        let count = entry.timestamps.length;
        return [name, count];
      });

      promises.push(promise);
    });

    Promise.all(promises).then((result) => {
      result.sort(function(first, second) {
        return second[1] - first[1];
      });

      let response = '**Blazes** \n';
      let lines = [];
      result.forEach((entry) => {
        let name = entry[0];
        let count = entry[1];
        lines.push(`${name}: ${count}`);
      });

      response += lines.join('\n');
      message.channel.send(response);
    });
  }
}