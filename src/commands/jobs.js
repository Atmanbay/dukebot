import Command from '../objects/command';
import { isEmpty } from 'lodash';

export default class JobsCommand extends Command {
  constructor(container) {
    super();
    this.jobsService = container.jobsService;
    this.loggerService = container.loggerService;
    this.details = {
      name: 'jobs',
      description: 'Hand out good jobs and bad jobs',
      args: [
        {
          name: 'g',
          description: 'User to give a good job to',
          optional: true
        },
        {
          name: 'b',
          description: 'User to give a bad job to',
          optional: true
        },
        {
          name: 'r',
          description: 'Reason for jobs',
          optional: true
        },
        {
          name: 'u',
          description: 'User to check jobs of',
          optional: true
        }
      ]
    };
  }

  execute(message, args) {
    try {
      if (!args.g && !args.b) {
        let user = args.u || message.author;
        this.jobsService.getJobs(user).then((result) => {
          if (!result) {
            return;
          }
          let response = `${result.nickname}\n${result.goodJobs} good jobs\n${result.badJobs} bad jobs`;
          message.channel.send(response);
        });
        
        return;
      } 

      let resolvedJobs = {
        good: this.jobsService.resolveJobs(args.g, 'good', message.author.id),
        bad: this.jobsService.resolveJobs(args.b, 'bad')
      }

      let response = '';
      if (args.r) {
        response += `The following jobs have been given out for ${args.r}\n\n`;
      }

      if (!isEmpty(resolvedJobs.good)) {
        response += '**Good Jobs**';
        Object.keys(resolvedJobs.good).forEach((key) => {
          let value = resolvedJobs.good[key];

          response += `\n${key}: ${value}`
        });

        if (!isEmpty(resolvedJobs.bad)) {
          response += '\n\n';
        }
      }

      if (!isEmpty(resolvedJobs.bad)) {
        response += '**Bad Jobs**';
        Object.keys(resolvedJobs.bad).forEach((key) => {
          let value = resolvedJobs.bad[key];

          response += `\n${key}: ${value}`
        });
      }

      message.channel.send(response);
    } catch (error) {
      this.loggerService(error, args);
    }
  }
}