import { blazes } from "@/helpers/database/index.js";
import moment from "moment-timezone";
import { MessageCreateHandler } from "../index.js";

export const isValidBlazeIt = (messageContent: string, time: moment.Moment) => {
  if (!messageContent.toLowerCase().includes("blaze it")) {
    return false;
  }

  if (!(time.minute() === 20 && (time.hour() === 4 || time.hour() === 16))) {
    return false;
  }

  return true;
};

const BlazeMessageCreateHandler: MessageCreateHandler = {
  execute: async (message) => {
    let currentTime = moment
      .utc(message.createdTimestamp)
      .tz("America/New_York");
    if (!isValidBlazeIt(message.content, currentTime)) {
      return;
    }

    currentTime = currentTime.set("s", 0);
    currentTime = currentTime.set("ms", 0);
    const guildMember = message.member;
    let blaze = blazes.get(
      (blaze) =>
        blaze.userId === guildMember.user.id &&
        blaze.created === currentTime.valueOf()
    );

    if (!blaze) {
      await blazes.create({
        userId: guildMember.user.id,
        created: currentTime.valueOf(),
      });

      await message.react("🔥");
    }
  },
};

export default BlazeMessageCreateHandler;
