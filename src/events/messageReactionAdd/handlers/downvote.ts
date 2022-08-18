import { jobs } from "../../../database/database.js";
import { Handler } from "../index.js";

const Upvote: Handler = {
  execute: async (message, user) => {
    await jobs.create({
      jobType: "bad",
      userId: message.author.id,
      messageId: message.id,
      granterUserId: user.id,
    });
  },
};

export default Upvote;
