import moment from "moment-timezone";

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
