export default class PermissionsService {
  constructor(container) {
    this.configService = container.configService;
  }

  isAdmin(guildMember) {
    let adminRoleName = this.configService.roles.admin;
    return guildMember.roles.cache.some(role => {
      return role.name === adminRoleName;
    });
  }

  hasTwitterRole(guildMember) {
    let twitterRoleName = this.configService.roles.twitter;
    return guildMember.roles.cache.some(role => {
      return role.name === twitterRoleName;
    });
  }
}