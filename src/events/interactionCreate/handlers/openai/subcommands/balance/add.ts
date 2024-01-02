import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  GuildMember,
  Role,
} from "discord.js";
import { paywallBalances } from "../../../../../../database/database.js";
import { logError } from "../../../../../../utils/logger.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "add",
  description: "Add to balance (bot owner only)",
  options: [
    {
      type: ApplicationCommandOptionType.Mentionable,
      name: "user",
      description: "The user/role to add the balance to",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "amount",
      description: "The amount to add",
      required: true,
    },
  ],
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  try {
    await interaction.deferReply({ ephemeral: true });

    const amount = interaction.options.getNumber("amount");
    let user = interaction.options.getMentionable("user");
    let guildMembers: GuildMember[] = [];
    if (!user) {
      guildMembers = [interaction.member as GuildMember];
    } else if ((user as Role).members) {
      guildMembers = Array.from((user as Role).members.values());
    } else {
      guildMembers = [user as GuildMember];
    }

    let promises = guildMembers.map(async (gm) => {
      let balance = paywallBalances.get((pb) => pb.userId == gm.user.id);
      if (balance) {
        balance.balance += amount;
        return [gm.nickname ?? gm.user.username, balance.balance] as const;
      } else {
        await paywallBalances.create({
          userId: gm.user.id,
          balance: amount,
        });
        return [gm.nickname ?? gm.user.username, amount] as const;
      }
    });

    let results = await Promise.all(promises);
    let response = "```";
    response += results
      .map((r) => {
        return `${r[0]}: ${r[1]}`;
      })
      .join("\n");
    response += "```";

    await interaction.editReply({
      content: response,
    });
  } catch (error) {
    logError(error);
    await interaction.editReply({
      content: "An error occurred when running this command",
    });
  }
};
