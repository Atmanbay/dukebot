export const toTable = (rows: [string, string][], buffer: number) => {
  let longestFirstCol = 0;
  rows.forEach(([a, b]) => {
    if (a.length > longestFirstCol) {
      longestFirstCol = a.length;
    }
  });

  let formattedTable = rows.map(([a, b]) => {
    return `${a}${" ".repeat(longestFirstCol - a.length + buffer)}${b}`;
  });

  return ["```", ...formattedTable, "```"].join("\n");
};
