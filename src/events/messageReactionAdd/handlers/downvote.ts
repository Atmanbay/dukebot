import { jobs } from "../../../database/database.js";
import { MessageReactionAddHandler } from "../index.js";

const DownvoteMessageReactionAddHandler: MessageReactionAddHandler = {
  execute: async (message, user) => {
    await jobs.create({
      jobType: "bad",
      userId: message.author.id,
      messageId: message.id,
      granterUserId: user.id,
    });
  },
};

export default DownvoteMessageReactionAddHandler;
