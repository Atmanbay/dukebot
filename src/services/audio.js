import fs from "fs";

export default class {
  constructor(services) {
    this.configService = services.config;
    this.loggingService = services.logging;
  }

  // Path can be a file path or a URL
  async play(path, channel) {
    if (!channel) {
      return;
    }

    let logging = this.loggingService;
    let connection = await channel.join();
    let dispatcher = connection.play(path);
    dispatcher.on("finish", () => {
      connection.disconnect();
    });

    dispatcher.on("error", logging.error);
  }

  getClips() {
    let files = [];
    fs.readdirSync(this.configService.paths.audio).forEach((file) => {
      files.push(file.replace(".mp3", ""));
    });

    return files;
  }
}
