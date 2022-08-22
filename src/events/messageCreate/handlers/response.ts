import moment from "moment-timezone";
import { responses } from "../../../database/database.js";
import { MessageCreateHandler } from "../index.js";

const ResponseMessageCreateHandler: MessageCreateHandler = {
  execute: async (message) => {
    let lowerContent = message.content.toLowerCase();
    let triggerTime = moment().valueOf();
    let responders = responses.list((response) => {
      try {
        if (response.lastTriggered) {
          let earliestTriggerTime =
            response.lastTriggered + response.cooldown * 60000;
          if (triggerTime <= earliestTriggerTime) {
            return;
          }
        }

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

      responder.lastTriggered = triggerTime;
      responses.update(responder);

      return responsePromises;
    });

    await Promise.all(responderPromises);
  },
};

export default ResponseMessageCreateHandler;
