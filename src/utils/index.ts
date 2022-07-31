import moment from "moment-timezone";
import glob from "glob";
import crypto from "crypto";

export const getTypeDict = <O extends any>(path: string) => {
  const files = glob.sync(path);
  let regex: RegExp;
  if (path.includes("**")) {
    regex = new RegExp(path.replace("**", "(.*?)"));
  }

  const classes = files.map((file) => {
    let fileName: string;
    if (regex) {
      fileName = file.match(regex)[1];
    } else {
      fileName = file.split("/").pop().replace(".ts", "");
    }

    return [fileName, require(file).default];
  });

  return Object.fromEntries(classes) as Record<string, O>;
};

export const getFiles = (path: string) => {
  return glob.sync(path);
};

export const getTimestamp = () => {
  return moment().format("YYYY-MM-DD hh:mm a");
};

export const generateId = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const buildTable = ({
  leftColumnWidth,
  rightColumnWidth,
  rows,
}: {
  leftColumnWidth: number;
  rightColumnWidth: number;
  rows: [string, string][];
}) => {
  let columnWidths = [leftColumnWidth, rightColumnWidth];

  return rows.map((row) => {
    let rowString = "";

    for (let col = 0; col < row.length; col++) {
      let cell = "";
      if (row[col]) {
        cell = String(row[col]);
      }
      let width = columnWidths[col];

      rowString += cell;
      let diff = width - cell.length;
      let buffer = "";
      for (let i = 0; i < diff; i++) {
        buffer += " ";
      }

      rowString += buffer;
    }

    return rowString;
  });
};
