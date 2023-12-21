import { jobs } from "@/helpers/database/index.js";
import { logInfo } from "@/helpers/logger.js";
import { MessageReactionRemoveHandler } from "../index.js";

const UpvoteMessageReactionRemoveHandler: MessageReactionRemoveHandler = {
  execute: async (message, user) => {
    let jobToDelete = jobs.get(
      (job) =>
        job.jobType === "good" &&
        job.userId === message.author.id &&
        job.messageId === message.id &&
        job.granterUserId === user.id
    );

    logInfo("to delete", jobToDelete);
    if (jobToDelete) {
      await jobs.delete(jobToDelete.id);
    }
  },
};

export default UpvoteMessageReactionRemoveHandler;
