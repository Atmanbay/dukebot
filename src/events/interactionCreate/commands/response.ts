import { responses } from "../../../services/response";
import { Command } from "../../../types/discord/command";
import { getTimestamp } from "../../../utils";

const Response: Command = {
  name: "response",
  description: "Create, update, or delete a trigger/response relationship",
  type: "CHAT_INPUT",
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
          description: "Trigger cooldown in minutes (defaults to 1 minute)",
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
  run: {
    create: async (interaction) => {
      const trigger = interaction.options.getString("trigger");
      const responseArray = interaction.options
        .getString("responses")
        .split("|");
      const cooldown = interaction.options.getNumber("cooldown") ?? 1;

      const response = await responses.get((r) => r.trigger === trigger);
      if (response) {
        await responses.update({
          id: response.id,
          trigger,
          responses: responseArray,
          cooldown,
          lastTriggered: getTimestamp(),
        });
      } else {
        await responses.create({
          trigger,
          responses: responseArray,
          cooldown,
          lastTriggered: getTimestamp(),
        });
      }

      interaction.reply({
        content: `Created a response for the trigger ${trigger}`,
        ephemeral: true,
      });
    },
    delete: async (interaction) => {
      const trigger = interaction.options.getString("trigger");

      const response = await responses.get((r) => r.trigger === trigger);
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

export default Response;
