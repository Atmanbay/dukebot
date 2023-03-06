import { ButtonInteraction, GuildMember } from "discord.js";
import { walkups } from "../../../../../database/database.js";
import { AudioUploadMessageAction } from "../../../../../database/models.js";

export const handler = async (
  interaction: ButtonInteraction,
  messageAction: AudioUploadMessageAction
) => {
  const author = interaction.member as GuildMember;
  let walkup = walkups.get((w) => w.userId === author.id);
  if (!walkup) {
    await walkups.create({
      userId: author.id,
      clip: messageAction.data.clipName,
    });
  } else {
    walkup.clip = messageAction.data.clipName;
    await walkups.update(walkup);
  }

  await interaction.reply({
    content: `Walkup set to \`${messageAction.data.clipName}\`!`,
    ephemeral: true,
  });
};
