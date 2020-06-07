import fs from 'fs';

export default class AudioService {
  constructor(container) {
    this.configService = container.configService;
  }

  play(path, channel) {
    if (!channel) {
      return;
    }
    
    channel.join().then((connection) => {
      let dispatcher = connection.play(path);
      dispatcher.on('finish', () => {
        connection.disconnect();
      });
      
      dispatcher.on('error', console.error);
    });
  }

  getClips() {
    let files = [];
    fs.readdirSync(this.configService.directories.audio).forEach((file) => {
      files.push(file.replace('.mp3', ''));
    });

    return files;
  }
}