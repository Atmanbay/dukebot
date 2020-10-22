export default class TwitterEmojiReactionHandler {

  // Gives user a job based on emoji used
  constructor(container) {
    this.loggerService = container.loggerService;
    this.guildService = container.guildService;
    this.configService = container.configService;
    this.reactionService = container.reactionService;
    this.jobsService = container.jobsService;
  }

  shouldHandle(messageReaction) {
    let emojis = [
      this.configService.emojis.goodJob,
      this.configService.emojis.badJob
    ]
    
    return emojis.includes(messageReaction.emoji.name)
  }

  async handle(messageReaction, user) { 
    try {
      let jobType = 'bad';
      let authorId = null; // Prevent upvoting own message
      if (messageReaction.emoji.name === this.configService.emojis.goodJob) {
        jobType = 'good';
        authorId = user.id;
      }

      let messageId = messageReaction.message.id;
      let { cachedMessage, created } = this.reactionService.findOrCreate(messageId);

      let users = cachedMessage.value()[jobType];
      if (!users) { // Users can only react a certain way once
        users = [];
      }

      if (users.includes(user.id)) {
        return;
      }

      users.push(user.id);

      cachedMessage
        .update(jobType, () => {
          return users;
        })
        .write();

      let goodJobCount = 0;
      let goodReactions = cachedMessage.value().good;
      if (goodReactions) {
        goodJobCount = goodReactions.length;
      }

      let badJobCount = 0;
      let badReactions = cachedMessage.value().bad;
      if (badReactions) {
        badJobCount = badReactions.length;
      }

      // Actually give the job now
      let guildMember = this.guildService.getUser(messageReaction.message.author.id);
      let jobs = this.jobsService.resolveJobs(guildMember, jobType, authorId);
      let nickname = Object.keys(jobs)[0];
      if (!nickname) {
        return;
      }

      let response = `${nickname} has been given`;
      if (goodJobCount > 0) {
        response += ` ${goodJobCount} good jobs`;

        if (badJobCount > 0) {
          response += ` and ${badJobCount} bad jobs`;
        }
      } else if (badJobCount > 0) {
        response += ` ${badJobCount} bad jobs`;
      }

      response += ' from emoji reactions';

      let channel = messageReaction.message.channel;
      if (!created) {
        let message = await channel.messages.fetch(cachedMessage.value().sentMessageId);
        message.edit(response);
      } else {
        let message = await channel.send(response);

        cachedMessage
          .assign({ sentMessageId: message.id })
          .write();
      }
    } catch (error) {
      this.loggerService.error(error);
    }
  }
}