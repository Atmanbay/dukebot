import { isEmpty } from "lodash";

export default class MessageHistoryService {
  constructor(container) {
    this.db = container.databaseService.get("messages");
    this.guildService = container.guildService;
    this.loggerService = container.loggerService;
    this.messageCount = container.configService.messageCount;

    this.commandPrefix = container.configService.prefix;
  }

  save(userId, message) {
    try {
      let dbUser = this.db.find({ userId: userId });
      if (isEmpty(dbUser.value())) {
        return; // Only save messages from people that have previously been fetched before
      }

      dbUser
        .update(`messages`, (messages) => {
          messages.push(message);
          if (messages.length > this.messageCount) {
            messages.splice(0, messages.length - this.messageCount);
          }

          return messages;
        })
        .write();
    } catch (error) {
      this.loggerService.error(error);
    }
  }

  async fetchMessages(userId = null) {
    if (!userId) {
      return this.db.value().flatMap((e) => e.messages);
    }

    let dbUser = this.db.find({ userId: userId }).value();
    if (dbUser) {
      return dbUser.messages;
    }

    let channels = this.guildService.getChannels("text");
    let messages = [];

    // Loop through all channels and fetch the last 500 messages
    // Then filter those messages down to messages from the specified user
    await Promise.all(
      channels.map(async (channel) => {
        try {
          let channelMessages = await this.fetchMessagesFromChannel(channel);
          if (!channelMessages) {
            return [];
          }

          return channelMessages
            .filter(
              (m) =>
                m.author.id === userId &&
                !m.content.startsWith(this.commandPrefix)
            )
            .map((m) => m.content);
        } catch (error) {
          return [];
        }
      })
    )
      .then((arrays) => {
        arrays.forEach((array) => {
          if (array) {
            messages.push(...array);
          }
        });
      })
      .catch((error) => this.loggerService.error(error));

    if (messages.length > this.messageCount) {
      messages.splice(0, messages.length - this.messageCount);
    }

    this.db
      .push({
        userId: userId,
        messages: messages,
      })
      .write();

    return messages;
  }

  async fetchMessagesFromChannel(channel, limit = 500) {
    let messages = [];
    let last_id = null;
    while (true) {
      try {
        let options = {
          limit: 100,
        };

        if (last_id) {
          options.before = last_id;
        }

        let messageBatch = await channel.messages
          .fetch(options)
          .catch((error) => {
            return null;
          });

        if (!messageBatch) {
          return null;
        }

        messages.push(...messageBatch);
        if (messageBatch.last()) {
          last_id = messageBatch.last().id;
        } else {
          last_id = null;
        }

        if (messageBatch.size != 100 || messages.length >= limit) {
          break;
        }
      } catch (error) {
        this.loggerService.error(error);
        return null;
      }
    }

    return messages.map((m) => m[1]);
  }
}
