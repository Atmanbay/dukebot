import emojiRegex from "emoji-regex";
import { responses } from "../../../database/database.js";
import { InteractionCreateHandler } from "../index.js";

const ResponseInteractionCreateHandler: InteractionCreateHandler = {
  name: "response",
  description: "Create, update, or delete a trigger/response relationship",
  options: [
    {
      type: "SUB_COMMAND",
      name: "create",
      description: "Create or modify a trigger/response relationship",
      options: [
        {
          type: "STRING",
          name: "trigger",
          description: "The word/phrase that will trigger the responses",
          required: true,
        },
        {
          type: "STRING",
          name: "responses",
          description:
            "The emoji reaction or message reply to send on trigger, separated by |",
          required: true,
        },
        {
          type: "NUMBER",
          name: "cooldown",
          description: "Trigger cooldown in minutes (defaults to 30 minutes)",
          required: false,
        },
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "delete",
      description:
        "Delete a trigger/response relationship based on the trigger",
      options: [
        {
          type: "STRING",
          name: "trigger",
          description: "The trigger to delete",
          required: true,
        },
      ],
    },
  ],
  handle: {
    create: async (interaction) => {
      const trigger = interaction.options.getString("trigger");
      const responseArray = interaction.options
        .getString("responses")
        .split("|");
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
    },
    delete: async (interaction) => {
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
    },
  },
};

export default ResponseInteractionCreateHandler;
