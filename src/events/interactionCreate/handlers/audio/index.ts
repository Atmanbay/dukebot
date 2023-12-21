import config from "@/helpers/config.js";
import { buildTable } from "@/helpers/general.js";
import { ChatInputApplicationCommandData } from "discord.js";
import { readdirSync } from "fs";

export const data: ChatInputApplicationCommandData = {
  name: "audio",
  description: "Play, upload, or list audio clips",
};

export const getClips = () => {
  let files: string[] = [];
  readdirSync(config.paths.audio).forEach((file) => {
    files.push(file.replace(".mp3", ""));
  });

  files.sort();
  return files;
};

export const getPages = () => {
  const clipNames = getClips();
  let perChunk = 20;
  let chunkedClips = clipNames.reduce((all, one, i) => {
    const ch = Math.floor(i / perChunk);
    all[ch] = [].concat(all[ch] || [], one);
    return all;
  }, []);

  return chunkedClips;
};

export const getPageOfClips = (pageNumber: number) => {
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
