import config from "@/helpers/config.js";
import { walkups } from "@/helpers/database/index.js";
import { VoiceChannel, VoiceState } from "discord.js";
import fs from "fs";
import { play } from "../../helpers/audio.js";
import { logError, logInfo } from "../../helpers/logger.js";
import { EventListener } from "../index.js";

const VoiceStateUpdateEventHandler: EventListener<"voiceStateUpdate"> = async (
  oldState: VoiceState,
  newState: VoiceState
) => {
  try {
    if (config.serverId !== newState.guild.id) {
      return;
    }

    // channelId will be blank if oldState->newState is leaving a voice channel
    if (!newState.channelId) {
      return;
    }

    // if going from voice channel to voice channel then don't play
    if (oldState.channelId && newState.channelId) {
      return;
    }

    // channelIds will equal each other if user just deafened/muted self
    if (oldState.channelId === newState.channelId) {
      return;
    }

    // don't play walkup if user is deafened or muted
    if (newState.selfDeaf || newState.selfMute) {
      return;
    }

    let walkup = walkups.get(
      (walkup) => walkup.userId === newState.member.user.id
    );
    if (!walkup) {
      return;
    }

    let path = `${config.paths.audio}/${walkup.clip}.mp3`;
    if (!fs.existsSync(path)) {
      logInfo(`Tried to play walkup ${walkup.clip} but file does not exist`);
      return;
    }

    await play(newState.channel as VoiceChannel, path);
  } catch (error) {
    logError(error);
  }
};

export default VoiceStateUpdateEventHandler;
