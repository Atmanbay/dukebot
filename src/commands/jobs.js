import Command from '../objects/command';
import { isEmpty } from 'lodash';
import joi from 'joi';

export default class JobsCommand extends Command {
  constructor(container) {
    super();
    this.jobsService = container.jobsService;
    this.loggerService = container.loggerService;
    let validator = container.validatorService;
    this.details = {
      name: 'jobs',
      description: 'Hand out good jobs and bad jobs',
      args: joi.object({
        good: joi
          .array()
          .items(joi.custom(validator.user.bind(validator)))
          .single()
          .note('User to give a good job to'),

        bad: joi
          .array()
          .items(joi.custom(validator.user.bind(validator)))
          .single()
          .note('User to give a bad job to'),

        reason: joi
          .string()
          .note('Reason for the jobs'),

        user: joi
          .custom(validator.user.bind(validator))
          .note('User to check the jobs of')
      })
        .without('user', ['reason', 'good', 'bad'])
        .rename('g', 'good')
        .rename('b', 'bad')
        .rename('r', 'reason')
        .rename('u', 'user')
    };
  }

  async execute(message, args) {
    try {
      // If no good or bad jobs handed out then get job counts
      if (!args.good && !args.bad) {
        let user = args.user ? args.user : message.author;
        let result = this.jobsService.getJobs(user);
        if (!result) {
          message.channel.send('No jobs found');
        }
        let response = `${result.nickname}\n${result.goodJobs} good jobs\n${result.badJobs} bad jobs`;
        message.channel.send(response);
        
        return;
      } 

      //Passing in message author to prevent giving yourself good jobs
      let resolvedJobs = {
        good: this.jobsService.resolveJobs(args.good, 'good', message.author.id),
        bad: this.jobsService.resolveJobs(args.bad, 'bad')
      }

      let response = 'The following jobs have been given out';
      if (args.reason) {
        response += ` for ${args.reason}`;
      }

      response += '\n\n';

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

      return {
        message: response,
        args: {
          text: response
        }
      }
    } catch (error) {
      this.loggerService.error(error);
    }
  }
}