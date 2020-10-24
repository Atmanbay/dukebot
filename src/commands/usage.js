import Command from "../objects/command";

export default class UsageCommand extends Command {
  constructor(container) {
    super();
    this.usageService = container.usageService;
    this.details = {
      name: "usage",
      description:
        "Get a leaderboard of the amount of times that each command has been called",
    };
  }

  execute(message) {
    let counts = this.usageService.getCounts();
    counts.sort((a, b) => b.usageCount - a.usageCount);

    let columnWidths = [12];
    let rows = counts.map((c) => {
      let rowString = "";

      rowString += c.name;
      rowString += this.createBuffer(columnWidths[0], c.name.length);

      rowString += c.usageCount;

      return rowString;
    });

    rows.unshift("NAME        COUNT");
    rows.unshift("```");
    rows.push("```");

    message.channel.send(rows);
  }

  createBuffer(columnWidth, cellLength) {
    let diff = columnWidth - cellLength;
    let buffer = "";
    for (let i = 0; i < diff; i++) {
      buffer += " ";
    }

    return buffer;
  }
}
