const Discord = require('discord.js');

export default class Bot {
  constructor() {
    this.client = new Discord.Client();
  }

  registerHandler(handler) {
    this.client.on(handler.event, handler.handle.bind(handler));
  }

  start(token) {
    this.client.login(token);
  }
}