export default class AudioService {
  constructor() {
    
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
}