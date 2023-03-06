import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ButtonStyle,
  ChatInputCommandInteraction,
} from "discord.js";
import { readdirSync } from "fs";
import { messageActions } from "../../../../../../database/database.js";
import { Button } from "../../../../../../database/models.js";
import config from "../../../../../../utils/config.js";
import {
  buildMessageActionRow,
  buildTable,
  generateId,
} from "../../../../../../utils/general.js";

export const data: ApplicationCommandOptionData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "list",
  description: "Lists all audio clips alphabetized by name",
};

const getClips = () => {
  let files: string[] = [];
  readdirSync(config.paths.audio).forEach((file) => {
    files.push(file.replace(".mp3", ""));
  });

  files.sort();
  return files;
};

const getPages = () => {
  const clipNames = getClips();
  let perChunk = 20;
  let chunkedClips = clipNames.reduce((all, one, i) => {
    const ch = Math.floor(i / perChunk);
    all[ch] = [].concat(all[ch] || [], one);
    return all;
  }, []);

  return chunkedClips;
};

const getPageOfClips = (pageNumber: number) => {
  let pages = getPages();
  let page = [...pages[pageNumber]];
  let buffer = 5;
  let columnWidth = Math.max(...page.map((c) => c.length)) + buffer;
  let halfway = Math.ceil(page.length / 2);
  let leftColumn = page.splice(0, halfway);

  let rows: [string, string][] = [];
  for (let i = 0; i < halfway; i++) {
    let row: [string, string] = [leftColumn.shift(), page.shift()];
    rows.push(row);
  }

  let table = buildTable({
    leftColumnWidth: columnWidth,
    rightColumnWidth: columnWidth,
    rows: rows,
  });
  table.unshift("```");
  table.push("```");
  return table;
};

export const handler = async (interaction: ChatInputCommandInteraction) => {
  const buttons: Button[] = [
    {
      type: "firstPage",
      label: "<<",
      buttonId: generateId(),
      style: ButtonStyle.Secondary,
    },
    {
      type: "previousPage",
      label: "<",
      buttonId: generateId(),
      style: ButtonStyle.Secondary,
    },
    {
      type: "nextPage",
      label: ">",
      buttonId: generateId(),
      style: ButtonStyle.Secondary,
    },
    {
      type: "lastPage",
      label: ">>",
      buttonId: generateId(),
      style: ButtonStyle.Secondary,
    },
  ];

  const messageActionRow = buildMessageActionRow(buttons);

  await interaction.reply({
    content: getPageOfClips(0).join("\n"),
    components: [messageActionRow],
    ephemeral: true,
  });

  await messageActions.create({
    interactionId: interaction.id,
    command: "audio",
    subcommand: "list",
    data: {
      currentPage: 0,
    },
    buttons,
  });
};
