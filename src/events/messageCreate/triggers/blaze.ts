import { Trigger } from "../index.js";
import { isValidBlazeIt, blazes } from "../../../services/blaze.js";

const Blaze: Trigger = {
  execute: async (message) => {
    if (!isValidBlazeIt(message.content, message.createdTimestamp)) {
      return;
    }

    const guildMember = message.member;
    let blaze = await blazes.get(
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
