import crypto from "crypto";
import glob from "glob";
import moment from "moment-timezone";

export const getTypeDict = async <O extends any>(
  path: string,
  options?: glob.IOptions
) => {
  const files = glob.sync(path, options);

  let regex: RegExp;
  if (path.includes("**")) {
    regex = new RegExp(path.replace("**", "(.*?)"));
  }

  const classesPromises = files.map(async (file) => {
    let fileName: string;
    if (regex) {
      fileName = file.match(regex)[1];
    } else {
      fileName = file.split("/").pop().replace(".ts", "");
    }

    const imported = await import(file);
    return [fileName, imported.default];
  });

  const classes = await Promise.all(classesPromises);

  return Object.fromEntries(classes) as Record<string, O>;
};

export const getFiles = (path: string) => {
  return glob.sync(path);
};

export const getTimestamp = () => {
  return moment().valueOf();
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
