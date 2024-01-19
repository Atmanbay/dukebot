import { Message } from "discord.js";
import { Feature } from "..";
import { getSingletonTable } from "../../database/database.js";
import { MessageContent } from "../../database/models.js";

const messageContents = await getSingletonTable<MessageContent>(
  "messageContents"
);

const save = async (message: Message) => {
  await messageContents.create({
    userId: message.member.user.id,
    content: message.content,
  });

  let userMessages = messageContents.list(
    (m) => m.userId === message.member.user.id
  );

  if (userMessages.length > 250) {
    userMessages = userMessages.sort((a, b) => {
      return b.created - a.created;
    });

    await messageContents.delete(userMessages.pop().id);
  }
};

const emoji: Feature = {
  load: async (loaders) => {
    loaders.messages.load(save);
  },
};

export default emoji;
