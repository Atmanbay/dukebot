import { isEmpty } from 'lodash';

export default class JobsService {
  constructor(container) {
    this.db = container.databaseService.get('jobs');
    this.guildService = container.guildService;
    this.loggerService = container.loggerService;
  }

  getJobs(user) {
    let jobCount = this.db.find({ id: user.id }).value();
    return this.guildService
      .getUser(user.id)
      .then((guildUser) => {
        let nickname = guildUser.nickname || guildUser.user.username;
        let goodJobs = 0;
        let badJobs = 0;
        if (jobCount) {
          goodJobs = jobCount.counts.good;
          badJobs = jobCount.counts.bad;
        }
        
        return Promise.resolve({
          nickname: nickname,
          goodJobs: goodJobs,
          badJobs: badJobs
        });
      })
      .catch((error) => {
      });
  }

  resolveJobs(jobs, type, authorUserId) {
    let users = this.convertToArray(jobs);
    let jobResults = {};
    if (users.length === 0)
      return jobResults;
    
    users.forEach((user) => {
      try {
        if (authorUserId && user.user.id === authorUserId) {
          return;
        }
  
        if (!user.user || !user.user.id) {
          this.loggerService.error('No user or userId for the following user', user)
          return;
        }
  
        let dbUser = this.db.find({ id: user.user.id });
        if (isEmpty(dbUser.value())) {
          this.db
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
        jobResults[nickname] = this.db.find({ id: user.user.id }).value().counts[type];
      } catch (error) {
        this.loggerService.error(error, [
          user
        ]);
      }
    });

    return jobResults;
  }

  // Needed because you can specify 1+ users
  // Converting everything to an array makes logic easy later
  convertToArray(users) {
    if (!users) {
      return [];
    } else if (Array.isArray(users)) {
      return users;
    } else {
      return [ users ];
    }
  }
}