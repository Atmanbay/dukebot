import { GuildChannel } from "discord.js";

export default class {
  constructor(services) {
    this.loggingService = services.logging;
    this.conversionService = services.conversion;
  }

  async user(value, helpers) {
    let user = await this.conversionService.getUser(value);
    if (!user) {
      throw new Error("No user found");
    }

    return user;
  }

  channel(value, helpers) {
    if (value instanceof GuildChannel) {
      return value;
    } else if (!(typeof value === "string")) {
      throw new Error("Must be a channel");
    }

    let channel = this.conversionService.getChannelByName(value);
    if (!channel) {
      throw new Error("No channel found");
    }

    return channel;
  }
}
