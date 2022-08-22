import { jobs } from "../../../database/database.js";
import { MessageReactionAddHandler } from "../index.js";

const UpvoteMessageReactionAddHandler: MessageReactionAddHandler = {
  execute: async (message, user) => {
    await jobs.create({
      jobType: "good",
      userId: message.author.id,
      messageId: message.id,
      granterUserId: user.id,
    });
  },
};

export default UpvoteMessageReactionAddHandler;
