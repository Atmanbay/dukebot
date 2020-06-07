export default class BotUserService {
  constructor(container) {
  }

  setBotUser(botUser) {
    this.botUser = botUser;
  }

  getBotUser() {
    return this.botUser;
  }
}