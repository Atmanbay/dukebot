export default class BotUserService {
  constructor(container) {
    this.botUser = container.botUser;
  }

  getBotUser() {
    return this.botUser;
  }
}
