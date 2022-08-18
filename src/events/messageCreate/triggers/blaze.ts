// import { isValidBlazeIt } from "../../../services/blaze.js";
import moment from "moment-timezone";
import { blazes } from "../../../database/database.js";
import { Trigger } from "../index.js";

export const isValidBlazeIt = (messageContent: string, timestamp: number) => {
  if (!messageContent.toLowerCase().includes("blaze it")) {
    return false;
  }

  let currentTime = moment.utc(timestamp).tz("America/New_York");
  if (
    !(
      currentTime.minute() === 20 &&
      (currentTime.hour() === 4 || currentTime.hour() === 16)
    )
  ) {
    return false;
  }

  return true;
};

const Blaze: Trigger = {
  execute: async (message) => {
    if (!isValidBlazeIt(message.content, message.createdTimestamp)) {
      return;
    }

    const guildMember = message.member;
    let blaze = blazes.get(
      (blaze) =>
        blaze.userId === guildMember.user.id &&
        blaze.created === message.createdTimestamp
    );

    if (!blaze) {
      await blazes.create({
        userId: guildMember.user.id,
        created: message.createdTimestamp,
      });

      await message.react("🔥");
    }
  },
};

export default Blaze;
