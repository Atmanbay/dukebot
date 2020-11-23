import ConfigService from "../services/config";
import Events from "../events";
const Discord = require("discord.js");

export default class {
  constructor() {
    this.client = new Discord.Client();
    this.eventsManager = new Events();
  }

  start() {
    this.client.on("ready", () => {
      let guilds = this.client.guilds.cache;
      guilds.forEach((guild) => {
        let events = this.eventsManager.buildEvents({
          guild: guild,
          botUser: this.client.user,
        });

        Object.keys(events).forEach((event) => {
          let handler = events[event];
          this.client.on(event, handler.handle.bind(handler));
        });
      });
    });

    let configService = new ConfigService();
    this.client.login(configService.token);
  }
}
