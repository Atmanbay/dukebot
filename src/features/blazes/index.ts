import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  GuildMember,
  Message,
  Role,
} from "discord.js";
import moment from "moment-timezone";
import { Feature } from "..";
import { getSingletonTable } from "../../database/database.js";
import { toTable } from "../../utils/format.js";

type Blaze = {
  id: string;
  created?: number;

  userId: string;
};

const blazes = await getSingletonTable<Blaze>("blazes");

const checkBlazes = async (interaction: ChatInputCommandInteraction) => {
  const mentionable =
    interaction.options.getMentionable("target") ??
    interaction.guild.roles.everyone;

  let guildMembers: GuildMember[] = [];
  if ((mentionable as Role).members) {
    guildMembers = Array.from((mentionable as Role).members.values());
  } else {
    guildMembers = [mentionable as GuildMember];
  }

  let guildMemberPromises = guildMembers.map(async (guildMember) => {
    let guildMemberBlazes = blazes.list(
      (blaze) => blaze.userId === guildMember.user.id
    );

    if (guildMemberBlazes.length === 0) {
      return null;
    }

    let name = guildMember.nickname ?? guildMember.user.username ?? "Anon";
    return {
      name,
      count: guildMemberBlazes.length,
    } as const;
  });

  let guildMemberBlazes = await Promise.all(guildMemberPromises);
  guildMemberBlazes = guildMemberBlazes
    .filter((gmj) => gmj)
    .sort((a, b) => {
      return b.count - a.count;
    });

  let rows: [string, string][] = guildMemberBlazes.map((value) => [
    value.name,
    value.count.toString(),
  ]);
  let table = toTable(rows, 2);

  await interaction.reply({ content: table });
};

export const isValidBlazeIt = (messageContent: string, time: moment.Moment) => {
  if (!messageContent.toLowerCase().includes("blaze it")) {
    return false;
  }

  if (!(time.minute() === 20 && (time.hour() === 4 || time.hour() === 16))) {
    return false;
  }

  return true;
};

const blazeIt = async (message: Message) => {
  let currentTime = moment.utc(message.createdTimestamp).tz("America/New_York");
  if (!isValidBlazeIt(message.content, currentTime)) {
    return;
  }

  currentTime = currentTime.set("s", 0);
  currentTime = currentTime.set("ms", 0);
  const guildMember = message.member;
  let blaze = blazes.get(
    (blaze) =>
      blaze.userId === guildMember.user.id &&
      blaze.created === currentTime.valueOf()
  );

  if (!blaze) {
    await blazes.create({
      userId: guildMember.user.id,
      created: currentTime.valueOf(),
    });

    await message.react("🔥");
  }
};

const blaze: Feature = {
  load: async (loaders) => {
    loaders.commands.load({
      type: ApplicationCommandType.ChatInput,
      name: "blazes",
      description: "Create and manage lines and bets",
      options: [
        {
          type: ApplicationCommandOptionType.Mentionable,
          name: "target",
          description:
            "The user/role to look up the blazes of (defaults to @everyone)",
          required: false,
        },
      ],
    });

    loaders.chatInput.load({ commandTree: ["blazes"], handler: checkBlazes });

    loaders.messages.load(blazeIt);
  },
};

export default blaze;
