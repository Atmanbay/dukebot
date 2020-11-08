import { GuildChannel } from "discord.js";

export default class ValidatorService {
  constructor(container) {
    this.loggerService = container.loggerService;
    this.conversionService = container.conversionService;
  }

  async user(value, helpers) {
    if (!(typeof value === "string")) {
      this.loggerService.info(`Was expecting string, instead got ${value}`);
      throw new Error("Must be a user");
    }

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
