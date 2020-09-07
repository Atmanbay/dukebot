import Command from '../objects/command';
import moment from 'moment';
import { isEmpty } from 'lodash';

export default class BlazeItCommand extends Command {
  constructor(container) {
    super();
    this.blazeService = container.blazeService;
    this.loggerService = container.loggerService;
    this.details = {
      name: 'blazes',
      description: 'Get the sorted leaderboard of blazes for the month',
      args: [
        {
          name: 'week',
          description: 'Flag to ask for this week\'s blaze leaderboard',
          optional: true
        },
        {
          name: 'year',
          description: 'Flag to ask for this year\'s blaze leaderboard',
          optional: true
        }
      ]
    };
  }

  async execute(message, args) {
    let cutoff = moment().startOf('month');
    if (args.week) {
      cutoff = moment().startOf('week');
    } else if (args.year) {
      cutoff = null;
    }

    try {
      let result = await this.blazeService.getBlazes(cutoff);
      if (isEmpty(result)) {
        return;
      }
      let response = '**Blazes';
      if (cutoff) {
        let frame = 'week';
        if (args.m) {
          frame = 'month';
        }
        response += ` this ${frame}`;
      }

      response += '** \n';
      let lines = [];
      result.forEach((entry) => {
        let name = entry[0];
        let count = entry[1];
        lines.push(`${name}: ${count}`);
      });

      response += lines.join('\n');
      message.channel.send(response);
    } catch (error) {
      this.loggerService.error('Error when creating blazes response', error);
    }
  }
}