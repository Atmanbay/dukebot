import { jobs } from "../../../database/database.js";
import { Handler } from "../index.js";

const Downvote: Handler = {
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

export default Downvote;
