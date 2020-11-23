export default class {
  constructor(services) {
    this.configService = services.config;
  }

  isAdmin(guildMember) {
    let adminRoleName = this.configService.roles.admin;
    if (!adminRoleName || !guildMember.roles) {
      return false;
    }

    return guildMember.roles.cache.some((role) => {
      return role.name === adminRoleName;
    });
  }

  hasTwitterRole(guildMember) {
    let twitterRoleName = this.configService.roles.twitter;
    if (!twitterRoleName || !guildMember.roles) {
      return false;
    }

    return guildMember.roles.cache.some((role) => {
      return role.name === twitterRoleName;
    });
  }
}
