import { jobs } from "@/helpers/database/index.js";
import { MessageReactionRemoveHandler } from "../index.js";

const DownvoteMessageReactionRemoveHandler: MessageReactionRemoveHandler = {
  execute: async (message, user) => {
    let jobToDelete = jobs.get(
      (job) =>
        job.jobType === "bad" &&
        job.userId === message.author.id &&
        job.messageId === message.id &&
        job.granterUserId === user.id
    );

    if (jobToDelete) {
      await jobs.delete(jobToDelete.id);
    }
  },
};

export default DownvoteMessageReactionRemoveHandler;
