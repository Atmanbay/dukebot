const ConfigService = require("../services/config.js");
const Events = require("../events/index.js");
// const Discord = require("discord.js");
const Discord = require("discord.js");
// const { Client, Intents } = require("discord.js");
// require("discord-reply");

module.exports = class {
  constructor() {
    this.client = new Discord.Client({
      intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
    });
  }

  start() {
    let configService = new ConfigService();
    this.client.on("ready", async () => {
      let guild = this.client.guilds.cache.find(
        (guild) => guild.id == configService.serverId
      );

      let events = new Events({
        guild: guild,
        botUser: this.client.user,
      });

      Object.keys(events).forEach((event) => {
        let handler = events[event];
        this.client.on(event, handler.handle.bind(handler));
      });
    });

    this.client.login(configService.token);
  }
};
