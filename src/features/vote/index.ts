import {
  ActionRowBuilder,
  AnySelectMenuInteraction,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  GuildMember,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { Feature } from "..";
import { getSingletonTable } from "../../database/database.js";
import { InteractionContext } from "../../database/models.js";

const interactionContexts = await getSingletonTable<InteractionContext>(
  "interactionContexts"
);

const handler = async (interaction: ChatInputCommandInteraction) => {
  const description = interaction.options.getString("description");
  const choices = interaction.options.getString("choices").split("|");
  const min = interaction.options.getNumber("min") ?? 1;
  const max = interaction.options.getNumber("max") ?? 1;

  if (min > max || max > choices.length) {
    await interaction.reply({
      content:
        "Max cannot be greater than the amount of choices or lesser than the min",
      ephemeral: true,
    });
    return;
  }

  const selector = new StringSelectMenuBuilder()
    .setCustomId("vote")
    .setPlaceholder("Select")
    .setMinValues(min)
    .setMaxValues(max);

  selector.addOptions(
    choices.map((c) => {
      return new StringSelectMenuOptionBuilder().setLabel(c).setValue(c);
    })
  );

  const button = new ButtonBuilder()
    .setCustomId("voteClear")
    .setLabel("Clear")
    .setStyle(ButtonStyle.Danger);

  let choiceText = "";
  if (max > 1) {
    choiceText = ` *(${min} - ${max} choices)*`;
  }
  let completeDescription = `**${description}**${choiceText}`;
  let content = completeDescription;
  content += "\n```\n";
  content += choices.map((c) => `${c} (0):  `).join("\n");
  content += "```";

  await interaction.reply({
    content: content,
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector),
      new ActionRowBuilder<ButtonBuilder>().addComponents(button),
    ],
  });

  let selections = {};
  choices.forEach((c) => {
    selections[c] = [];
  });

  await interactionContexts.create({
    interactionId: interaction.id,
    context: {
      description: completeDescription,
      selections: selections,
    },
  });
};

const voteSelectHandler = async (
  interaction: AnySelectMenuInteraction,
  context: InteractionContext
) => {
  let nickname =
    (interaction.member as GuildMember).nickname ??
    interaction.member.user.username;
  let userSelections = interaction.values;
  let selections: { [choice: string]: string[] } = context.context.selections;
  let tempSelections: { [choice: string]: string[] } = {};

  Object.entries(selections).forEach(([choice, users]) => {
    let tempUsers = users.filter((u) => u !== nickname).sort();
    if (userSelections.includes(choice)) {
      tempSelections[choice] = [...tempUsers, nickname];
    } else {
      tempSelections[choice] = tempUsers;
    }
  });

  context.context.selections = tempSelections;

  await interactionContexts.update(context);

  let content = context.context.description;
  content += "\n```\n";
  Object.entries(tempSelections).forEach(([choice, users]) => {
    content += `${choice} (${users.length}): ${users.join(", ")}\n`;
  });
  content += "```";

  await interaction.update({
    content: content,
  });
};

const voteClearHandler = async (
  interaction: ButtonInteraction,
  context: InteractionContext
) => {
  let nickname =
    (interaction.member as GuildMember).nickname ??
    interaction.member.user.username;
  let selections: { [choice: string]: string[] } = context.context.selections;
  let tempSelections: { [choice: string]: string[] } = {};

  Object.entries(selections).forEach(([choice, users]) => {
    let tempUsers = users.filter((u) => u !== nickname).sort();
    tempSelections[choice] = tempUsers;
  });

  context.context.selections = tempSelections;

  await interactionContexts.update(context);

  let content = context.context.description;
  content += "\n```\n";
  Object.entries(tempSelections).forEach(([choice, users]) => {
    content += `${choice} (${users.length}): ${users.join(", ")}\n`;
  });
  content += "```";

  await interaction.update({
    content: content,
  });
};

const emoji: Feature = {
  load: async (loaders) => {
    loaders.commands.load({
      type: ApplicationCommandType.ChatInput,
      name: "vote",
      description: "Create a vote",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "description",
          description: "Description of what the vote is about",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "choices",
          description: "Choices that voters can choose, separated by |",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.Number,
          name: "min",
          description:
            "Minimum amount of choices that user can select (defaults to 1)",
          required: false,
        },
        {
          type: ApplicationCommandOptionType.Number,
          name: "max",
          description:
            "Maximum amount of choices that user can select (defaults to 1)",
          required: false,
        },
      ],
    });

    loaders.chatInput.load({ commandTree: ["vote"], handler: handler });
    loaders.buttons.load({ id: "voteClear", handler: voteClearHandler });
    loaders.selectMenus.load({ id: "vote", handler: voteSelectHandler });
  },
};

export default emoji;
