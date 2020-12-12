import fs from "fs";

export default class {
  constructor(services) {
    this.configService = services.config;
    this.loggerService = services.logger;
  }

  // Path can be a file path or a URL
  async play(path, channel) {
    if (!channel) {
      return;
    }

    let logger = this.loggerService;
    let connection = await channel.join();
    let dispatcher = connection.play(path);
    dispatcher.on("finish", () => {
      connection.disconnect();
    });

    dispatcher.on("error", logger.error);
  }

  getClips() {
    let files = [];
    fs.readdirSync(this.configService.paths.audio).forEach((file) => {
      files.push(file.replace(".mp3", ""));
    });

    return files;
  }
}