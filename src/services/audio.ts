import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { VoiceChannel } from "discord.js";
import { readdirSync } from "fs";
import config from "./config.js";

const player = createAudioPlayer({
  behaviors: { noSubscriber: NoSubscriberBehavior.Play },
});

export const disconnect = async (connection: VoiceConnection) => {
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
    adapterCreator: channel.guild.voiceAdapterCreator,
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

export const getClips = () => {
  let files: string[] = [];
  readdirSync(config.paths.audio).forEach((file) => {
    files.push(file.replace(".mp3", ""));
  });

  files.sort();
  return files;
};
