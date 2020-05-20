import Command from '../structures/command';
import { isEmpty } from 'lodash';

export default class JobsCommand extends Command {
  constructor() {
    super();
    this.details = {
      name: 'jobs',
      description: 'Play specified audio clip',
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

  convertToArray(users) {
    if (!users) {
      return [];
    } else if (Array.isArray(users)) {
      return users;
    } else {
      return [ users ];
    }
  }

  handleJobs(jobsDb, type, users) {
    let jobResults = {};
    if (users.length === 0)
      return jobResults;
    
    users.forEach((user) => {
      let dbUser = jobsDb.find({ id: user.user.id });
      if (isEmpty(dbUser.value())) {
        jobsDb
          .push({
            id: user.user.id,
            counts: {
              good: 0,
              bad: 0
            }
          })
          .write();
      }

      dbUser
        .update(`counts.${type}`, count => count + 1)
        .write();        

      let nickname = user.nickname || user.user.username;
      jobResults[nickname] = jobsDb.find({ id: user.user.id }).value().counts[type];
    });
  }

  execute(message, args, database) {
    let jobs = database.get('jobs');
    if (!args.g && !args.b) {
      let user = args.u || message.author;
      let jobCount = jobs.find({ id: user.id }).value();
      message.guild.members.fetch(user.id).then((guildUser) => {
        let nickname = guildUser.nickname;
        let goodJobs = 0;
        let badJobs = 0;
        if (jobCount) {
          goodJobs = jobCount.counts.good;
          badJobs = jobCount.counts.bad;
        }
        
        let response = `${nickname}\n${goodJobs} good jobs\n${badJobs} bad jobs`;
        message.channel.send(response);
      });
      
      return;
    }

    let resolvedJobs = {
      good: this.handleJobs(jobs, 'good', this.convertToArray(args.g)),
      bad: this.handleJobs(jobs, 'bad', this.convertToArray(args.b))
    };

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
  }
}