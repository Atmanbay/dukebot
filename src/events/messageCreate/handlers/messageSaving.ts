import { messages } from "../../../database/database.js";
import { MessageCreateHandler } from "../index.js";

const MessageSavingMessageCreateHandler: MessageCreateHandler = {
  execute: async (message) => {
    await messages.create({
      userId: message.member.user.id,
      content: message.content,
    });

    let userMessages = messages.list(
      (m) => m.userId === message.member.user.id
    );

    if (userMessages.length > 250) {
      userMessages = userMessages.sort((a, b) => {
        return b.created - a.created;
      });

      await messages.delete(userMessages.pop().id);
    }
  },
};

export default MessageSavingMessageCreateHandler;
