import Command from '../objects/command';
import moment from 'moment';
import { isEmpty } from 'lodash';
import joi from 'joi';

export default class BlazeItCommand extends Command {
  constructor(container) {
    super();
    this.blazeService = container.blazeService;
    this.loggerService = container.loggerService;
    this.details = {
      name: 'blazes',
      description: 'Get the sorted leaderboard of blazes for the month',
      args: joi.object({
        week: joi
          .boolean()
          .note('Flag to show scores for this week'),

        month: joi
          .boolean()
          .note('Flag to show scores for this month'),

        year: joi
          .boolean()
          .note('Flag to show scores for this year')
      })
        .oxor('week', 'month', 'year')
        .rename('w', 'week')
        .rename('m', 'month')
        .rename('y', 'year')
    };
  }

  async execute(message, args) {
    let cutoff = moment().startOf('month');
    let frame = 'month';
    if (args.week) {
      cutoff = moment().startOf('week');
      frame = 'week';
    } else if (args.year) {
      cutoff = null;
      frame = null;
    }

    try {
      let result = await this.blazeService.getBlazes(cutoff);
      if (isEmpty(result)) {
        return;
      }
      let response = '**Blazes';
      if (frame) {
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