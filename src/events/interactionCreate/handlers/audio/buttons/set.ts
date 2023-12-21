import { walkups } from "@/helpers/database/index.js";
import { AudioUploadMessageAction } from "@/helpers/database/models.js";
import { ButtonInteraction, GuildMember } from "discord.js";

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
