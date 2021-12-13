module.exports = class {
  build(columnWidths, rows) {
    return rows.map((row) => {
      let rowString = "";

      for (let col = 0; col < row.length; col++) {
        let cell = String(row[col]);
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
  }
};
