module.exports = class {
  constructor(services) {
    this.botUser = services.values.botUser;
  }

  getBotUser() {
    return this.botUser;
  }
};
