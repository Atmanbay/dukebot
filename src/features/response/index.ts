import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";
import emojiRegex from "emoji-regex";
import moment from "moment-timezone";
import { Feature } from "..";
import { getSingletonTable } from "../../database/database.js";
import { BaseDatabaseObject } from "../../database/models.js";

type Response = BaseDatabaseObject & {
  trigger: string;
  responses: { type: "string" | "emoji" | "customEmoji"; value: string }[];
  cooldown?: number;
  lastTriggered?: number;
};

const responses = await getSingletonTable<Response>("responses");

const createHandler = async (interaction: ChatInputCommandInteraction) => {
  const trigger = interaction.options.getString("trigger");
  const responseArray = interaction.options.getString("responses").split("|");
  const cooldown = interaction.options.getNumber("cooldown");

  let parsedResponseArray = responseArray.map((response) => {
    let emojiMatch = emojiRegex().exec(response);
    if (emojiMatch) {
      let emoji = emojiMatch[0];
      return {
        type: "emoji",
        value: emoji,
      } as const;
    }

    let isCustomEmoji = RegExp("<:(.*?):(.*?)>");
    let customEmojiMatch = response.match(isCustomEmoji);
    if (customEmojiMatch) {
      let customEmojiId = customEmojiMatch[2];
      return {
        type: "customEmoji",
        value: customEmojiId,
      } as const;
    }

    if (typeof response === "string") {
      return {
        type: "string",
        value: response,
      } as const;
    }
  });

  const response = responses.get((r) => r.trigger === trigger);
  if (response) {
    response.trigger = trigger;
    response.responses = parsedResponseArray;
    if (cooldown) {
      response.cooldown = cooldown;
    }

    await responses.update(response);
  } else {
    await responses.create({
      trigger,
      responses: parsedResponseArray,
      cooldown: cooldown ?? 30,
    });
  }

  await interaction.reply({
    content: `Created a response for the trigger ${trigger}`,
    ephemeral: true,
  });
};

const deleteHandler = async (interaction: ChatInputCommandInteraction) => {
  const trigger = interaction.options.getString("trigger");

  const response = responses.get((r) => r.trigger === trigger);
  if (response) {
    await responses.delete(response.id);
    interaction.reply({
      content: `Deleted response for trigger ${trigger}`,
      ephemeral: true,
    });
  } else {
    interaction.reply({
      content: `No response found for trigger ${trigger}`,
      ephemeral: true,
    });
  }
};

const messageHandler = async (message: Message) => {
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
};

const emoji: Feature = {
  load: async (loaders) => {
    loaders.commands.load({
      type: ApplicationCommandType.ChatInput,
      name: "response",
      description: "Create or delete response triggers",
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "create",
          description: "Create or modify a trigger/response relationship",
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: "trigger",
              description: "The word/phrase that will trigger the responses",
              required: true,
            },
            {
              type: ApplicationCommandOptionType.String,
              name: "responses",
              description:
                "The emoji reaction or message reply to send on trigger, separated by |",
              required: true,
            },
            {
              type: ApplicationCommandOptionType.Number,
              name: "cooldown",
              description:
                "Trigger cooldown in minutes (defaults to 30 minutes)",
              required: false,
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "delete",
          description:
            "Delete a trigger/response relationship based on the trigger",
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: "trigger",
              description: "The word/phrase that will trigger the responses",
              required: true,
            },
          ],
        },
      ],
    });

    loaders.chatInput.load({
      commandTree: ["response", "create"],
      handler: createHandler,
    });
    loaders.chatInput.load({
      commandTree: ["response", "delete"],
      handler: deleteHandler,
    });

    loaders.messages.load(messageHandler);
  },
};

export default emoji;
