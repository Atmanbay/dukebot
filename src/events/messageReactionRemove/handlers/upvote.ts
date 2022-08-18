import { jobs } from "../../../database/database.js";
import { logInfo } from "../../../utils/logger.js";
import { Handler } from "../index.js";

const Upvote: Handler = {
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

export default Upvote;
