import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  entersState,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { VoiceChannel } from "discord.js";

const player = createAudioPlayer({
  behaviors: { noSubscriber: NoSubscriberBehavior.Play },
});

const disconnect = async (connection: VoiceConnection) => {
  if (
    connection &&
    connection.state.status !== VoiceConnectionStatus.Destroyed
  ) {
    connection.destroy();
  }
};

export const play = async (channel: VoiceChannel, path: string) => {
  let connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild
      .voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator, // annoying workaround for now
    debug: true,
    selfDeaf: false,
  });

  connection.on(VoiceConnectionStatus.Ready, () => {
    let resource = createAudioResource(path);
    player.play(resource);
    player.on(AudioPlayerStatus.Idle, () => disconnect(connection));
    player.on("error", () => disconnect(connection));
    connection.subscribe(player);
  });

  await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
};
