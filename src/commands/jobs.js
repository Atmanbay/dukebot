import Command from '../structures/command';
import Database from '../database';
import { isEmpty } from 'lodash';

let convertToArray = function(users) {
  if (!users) {
    return [];
  } else if (Array.isArray(users)) {
    return users;
  } else {
    return [ users ];
  }
}

let handleJobs = function(jobsDb, type, users) {
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

  return jobResults;
}

export default new Command({
  name: 'jobs',
  execute: function(msg, args) {
    let jobs = Database.get('jobs');
    let resolvedJobs = {
      good: handleJobs(jobs, 'good', convertToArray(args.g)),
      bad: handleJobs(jobs, 'bad', convertToArray(args.b))
    };

    let message = '';
    if (args.r) {
      message += `The following jobs have been given out for ${args.r}\n\n`;
    }

    if (!isEmpty(resolvedJobs.good)) {
      message += '**Good Jobs**';
      Object.keys(resolvedJobs.good).forEach((key) => {
        let value = resolvedJobs.good[key];

        message += `\n${key}: ${value}`
      });

      if (!isEmpty(resolvedJobs.bad)) {
        message += '\n\n';
      }
    }

    if (!isEmpty(resolvedJobs.bad)) {
      message += '**Bad Jobs**';
      Object.keys(resolvedJobs.bad).forEach((key) => {
        let value = resolvedJobs.bad[key];

        message += `\n${key}: ${value}`
      });
    }

    msg.channel.send(message);
  }
});