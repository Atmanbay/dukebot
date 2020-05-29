import Command from '../objects/command';

export default class BlazeItCommand extends Command {
  constructor(container) {
    super();
    this.blazeService = container.blazeService;
    this.details = {
      name: 'blazes',
      description: 'Get the sorted leaderboard of blazes',
      args: []
    };
  }

  execute(message) {
    this.blazeService.getBlazes().then((result) => {
      let response = '**Blazes** \n';
      let lines = [];
      result.forEach((entry) => {
        let name = entry[0];
        let count = entry[1];
        lines.push(`${name}: ${count}`);
      });

      response += lines.join('\n');
      message.channel.send(response);
    })
    .catch((error) => {
      console.log(error);
    });
  }
}