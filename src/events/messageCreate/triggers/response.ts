import { responses } from "../../../database/database.js";
import { Trigger } from "../index.js";

const Response: Trigger = {
  execute: async (message) => {
    let lowerContent = message.content.toLowerCase();
    let responders = responses.list((response) => {
      try {
        let regex = new RegExp(`\\b${response.trigger.toLowerCase()}\\b`);
        let matches = lowerContent.match(regex);
        if (matches) {
          return true;
        }
      } catch (error) {
        return false;
      }
    });

    let responderPromises = responders.map(async (responder) => {
      let responsePromises = responder.responses.map(async (response) => {
        if (response.type === "string") {
          return message.channel.send(response.value);
        } else if (response.type === "customEmoji") {
          let customEmoji = message.guild.emojis.resolve(response.value);
          return message.react(customEmoji);
        } else if (response.type === "emoji") {
          return message.react(response.value);
        }
      });

      return responsePromises;
    });

    await Promise.all(responderPromises);
  },
};

export default Response;
