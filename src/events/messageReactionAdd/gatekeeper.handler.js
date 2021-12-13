module.exports = class {
  constructor(services) {
    // this.gatekeeperService = services.gatekeeper;
    // this.guildService = services.guild;
    // this.permissionsService = services.permissions;
  }

  shouldHandle(messageReaction) {
    return false;
    // return this.gatekeeperService.gatekeepExists(messageReaction.message.id);
  }

  async handle(messageReaction, user) {
    // let gatekeepEmoji = this.gatekeeperService.getGatekeepEmoji(
    //   messageReaction.message.id
    // );
    // let reactionEmoji = messageReaction.emoji.name;
    // if (gatekeepEmoji.name !== reactionEmoji.name) {
    //   return;
    // }
    // if (gatekeepEmoji.count > messageReaction.users.cache.length) {
    //   return;
    // }
    // let filterUser = async function (user) {
    //   let guildMember = await this.guildService.getUser(user.id);
    //   return this.permissionsService.hasRole(guildMember, gatekeepEmoji.role);
    // };
    // let reactedUserCount = messageReaction.users.cache.filter(
    //   filterUser.bind(this)
    // ).size;
    // if (gatekeepEmoji.count > reactedUserCount) {
    //   return;
    // }
    // this.gatekeeperService.proceed(messageReaction.message.id);
    // let authorId = messageReaction.message.author.id;
    // let reactorId = user.id;
    // if (authorId === reactorId) {
    //   return;
    // }
    // let reactionName = messageReaction.emoji.name;
    // let messageId = messageReaction.message.id;
    // this.reactionService.findOrCreate(messageId);
    // if (this.reactionService.hasUser(messageId, reactionName, reactorId)) {
    //   return;
    // }
    // this.reactionService.addUser(messageId, reactionName, reactorId);
    // this.jobsService.addJob(authorId, 1);
  }
};
