import { find } from 'lodash';

export default class MessageHandler {
  constructor(container) {
    this.event = 'messageReactionAdd';
    this.loggerService = container.loggerService;
    this.guildService = container.guildService;
    this.permissionsService = container.permissionsService;
    this.configService = container.configService;
    this.twitterService = container.twitterService;
    this.jobsService = container.jobsService;

    // Used to keep reacted-to messages in memory
    // TODO: Make this a database function in the future if need be
    this.messages = [];
  }

  async handle(messageReaction, user) {
    // Only respond to event if it occurred in the guild this handler is responsible for
    if (!this.guildService.isThisGuild(messageReaction.message.channel.guild)) {
      return;
    }

    try {
      this.handleTwitter(messageReaction, user);
      this.handleJobs(messageReaction, user);
    } catch (error) {
      this.loggerService.error(error);
    }
  }

  async handleTwitter(messageReaction, user) {
    if (!this.configService.useTwitter) {
      return;
    }

    let guildMember = this.guildService.getUser(user.id);
    if (!this.permissionsService.hasTwitterRole(guildMember)) {
      return;
    }

    let twitterReactionEmoji = this.configService.emojis.twitter;
    if (twitterReactionEmoji !== messageReaction.emoji.name) {
      return;
    }

    let filterUser = async function(user) {
      let guildMember = this.guildService.getUser(user.id);
      return this.permissionsService.hasTwitterRole(guildMember);
    };

    let reactedUserCount = messageReaction.users.cache.filter(filterUser.bind(this)).size;
    let twitterRoleUserCount = this.guildService.getRole(this.configService.roles.twitter).members.size;
    let divided = twitterRoleUserCount / reactedUserCount;
    if (!divided || divided > 2) {
      return;
    }

    this.twitterService
      .tweet(messageReaction.message.content)
      .then(response => {
        messageReaction.message.channel.send(`https://twitter.com/${response.user.screen_name}/status/${response.id_str}`);
      })
      .catch(error => {
        this.loggerService.error(error);
      });
  }

  async handleJobs(messageReaction, user) {

    // Determine if emoji is one of the ones related to jobs
    let authorId = null;
    let type = '';
    if (messageReaction.emoji.name === this.configService.emojis.goodJob) {
      authorId = user.id;
      type = 'good';
    } else if (messageReaction.emoji.name === this.configService.emojis.badJob) {
      type = 'bad';
    } else {
      return;
    }

    // Gives user a job based on emoji used
    let guildMember = this.guildService.getUser(messageReaction.message.author.id);
    let jobs = this.jobsService.resolveJobs(guildMember, type, authorId);
    let nickname = Object.keys(jobs)[0];
    if (!nickname) {
      return;
    }

    // Checks to see if we've handled the reacted-to message already
    let messageObject = find(this.messages, function(m) {
      return m.reactedMessageId === messageReaction.message.id; 
    });

    let channel = messageReaction.message.channel;
    if (messageObject) {
      // If we have handled the message then we edit that one instead of posting a new one
      messageObject.jobs[type] += 1;
      let message = await channel.messages.fetch(messageObject.sentMessageId);
      let response = `${nickname} has been given`;
      if (messageObject.jobs.good > 0) {
        response += ` ${messageObject.jobs.good} good jobs`

        if (messageObject.jobs.bad > 0) {
          response += ` and ${messageObject.jobs.bad} bad jobs`
        }
      } else if (messageObject.jobs.bad > 0) {
        response += ` ${messageObject.jobs.bad} bad jobs`
      }

      response += ' from message reactions';
      message.edit(response);
    } else {
      // If we haven't handled the message yet then we post a new one and save it in memory for editing later
      let sentMessage = await channel.send(`${nickname} has been given 1 ${type} job from message reactions`)

      let messageObject = {
        reactedMessageId: messageReaction.message.id,
        sentMessageId: sentMessage.id,
        jobs: {
          good: 0,
          bad: 0
        }
      }

      messageObject.jobs[type] = 1;

      this.messages.push(messageObject);

      // Only keep the last 10 messages reacted to
      if (this.messages.length > 10) {
        this.messages = this.messages.slice(this.messages.length - 10);
      }
    }
  }
}