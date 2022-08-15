import { MessageAttachment } from "discord.js";
import { buildMessageActionRow } from "../../../services/button.js";
import { messageActions } from "../../../services/database.js";
import { getCombinedEmojiName, getEmojiPath } from "../../../services/emoji.js";
import { generateId } from "../../../services/general.js";
import { Command } from "../index.js";

const Emoji: Command = {
  name: "emoji",
  description: "Combines two emojis using Google's Emoji Kitchen",
  options: [
    {
      type: "STRING",
      name: "first",
      description: "The first emoji to combine",
      required: true,
    },
    {
      type: "STRING",
      name: "second",
      description: "The second emoji to combine",
      required: true,
    },
  ],
  run: async (interaction) => {
    const first = interaction.options.getString("first");
    const second = interaction.options.getString("second");

    let path = await getEmojiPath(first, second);
    if (path) {
      const messageAction = await messageActions.create({
        interactionId: interaction.id,
        data: {
          command: "emoji",
          subcommand: "combine",
          path,
          emojiName: getCombinedEmojiName(first, second),
        },
        buttons: [
          {
            type: "save",
            label: "Save",
            buttonId: generateId(),
            style: "PRIMARY",
          },
        ],
      });

      const messageActionRow = buildMessageActionRow(messageAction.buttons);

      let attachment = new MessageAttachment(path);
      await interaction.reply({
        content: `${first} + ${second}`,
        files: [attachment],
        components: [messageActionRow],
      });
    } else {
      await interaction.reply({
        content: "That emoji combo does not exist",
        ephemeral: true,
      });
    }
  },
  handleButton: {
    save: async ({ interaction, messageAction }) => {
      if (messageAction.data.subcommand !== "combine") {
        return;
      }

      await interaction.guild.emojis.create(
        messageAction.data.path,
        messageAction.data.emojiName
      );

      await interaction.reply({
        content: `Emoji saved as \`:${messageAction.data.emojiName}:\``,
        ephemeral: true,
      });
    },
  },
};

export default Emoji;
