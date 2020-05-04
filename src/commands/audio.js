import Command from '../structures/command';

export default new Command({
  details: {
    name: 'audio',
    description: 'Play specified audio clip',
    args: [
      {
        name: 'n',
        description: 'Name of audio clip',
        optional: false
      },
      {
        name: 'c',
        description: 'Name of voice channel to play in (defaults to users current channel)',
        optional: true
      }
    ]
  },
  execute: function(message, args) {
    let clipName = args.n;
    let channel;
    if (args.c) {
      channel = message.guild.channels.cache.find(channel => channel.name === args.c && channel.type === 'voice');
    } else {
      channel = message.member.voice.channel;
    }

    channel.join().then((connection) => {
      let dispatcher = connection.play(`${__dirname}/${clipName}.mp3`)     
      dispatcher.on('finish', () => {
        connection.disconnect();
      });
      
      dispatcher.on('error', console.error);
    });
  }
});