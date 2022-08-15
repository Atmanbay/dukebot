import { isValidBlazeIt } from "../../../services/blaze.js";
import { blazes } from "../../../services/database.js";
import { Trigger } from "../index.js";

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
