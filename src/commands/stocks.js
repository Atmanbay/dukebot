import Command from '../objects/command';

export default class StocksCommand extends Command {
  constructor(container) {
    super();
    this.stocksService = container.stocksService;
    this.details = {
      name: 'stocks',
      description: 'Check the stocks leaderboard',
    };
  }

  async execute(message) {
    let rows = await this.stocksService.fetchLeaderboard();

    // Use set column widths so that all columns line up
    // Creates spaces to fill each column dynamically
    let columnWidths = [7, 17, 13]
    let response = rows.map(row => {
      let rowString = row.rank;
      let columnWidth = columnWidths[0] - row.rank.length;
      for (let i = 0; i < columnWidth; i++) {
        rowString += ' ';
      }

      rowString += row.name;
      columnWidth = columnWidths[1] - row.name.length;
      for (let i = 0; i < columnWidth; i++) {
        rowString += ' ';
      }

      rowString += row.value;
      columnWidth = columnWidths[2] - row.value.length;
      for (let i = 0; i < columnWidth; i++) {
        rowString += ' ';
      }

      rowString += row.percentChange + '%';
      
      return rowString;
    });

    response.unshift('RANK   NAME             VALUE        % CHANGE');
    response.unshift('```');
    response.push('```');

    await message.channel.send(response);
  }
}