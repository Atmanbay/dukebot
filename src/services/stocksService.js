import request from 'request-promise-native';
import { parse } from 'node-html-parser';
import moment from 'moment';

export default class StocksService {
  constructor(container) {
    this.configService = container.configService;
    this.loggerService = container.loggerService;
  }

  async fetchLeaderboard() {
    // Set jar to true so it keeps track of cookies
    let r = request.defaults({jar: true});
    var options = {
      method: 'POST',
      uri: 'https://www.howthemarketworks.com/login',
      followAllRedirects: true,
      form: {
        UserName: this.configService.stocks.username,
        Password: this.configService.stocks.password,
        RememberMe: false,
        Regto: ''
      },
      // The headers worked on first try so didn't mess with them too much
      // Wouldn't remove any of these though unless it breaks
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36'
      }
    }

    try {
      // Logon request
      await r(options).catch(error => {
        this.loggerService.error(error);
      });

      // Request to get the JSON that has the HTML table as an attribute :)
      let url = 'https://www.howthemarketworks.com/accounting/getrankings';
      let jsonString = await r({
        method: 'GET',
        uri: url,
        qs: {
          pageIndex: 0,
          pageSize: 50,
          tournamentID: this.configService.stocks.contestId,
          rankingType: 'Overall',
          date: encodeURI(moment().format("L"))
        }
      }).catch(error => {
        this.loggerService.error(error);
      });

      if (!jsonString) {
        return;
      }

      let json = JSON.parse(jsonString);
      let root = parse(json.Html);
  
      let table = root.querySelector('table');
      let rows = table.querySelectorAll('tr').slice(2);

      let beginningValue = 50000.00;
      return rows.map(row => {
        let cells = row.querySelectorAll('td');
        let rank = cells[0].structuredText;
        let name = cells[2].structuredText;
        let value = parseFloat(cells[3].structuredText.replace(',', ''));

        // The percent change is in the table but would require more parsing so took the easy way out
        let percentChange = parseFloat((value - beginningValue) / beginningValue) * 100;
        percentChange = percentChange.toFixed(2);

        return {
          rank: rank,
          name: name,
          value: Number(value).toLocaleString(),
          percentChange: percentChange
        };
      });
    } catch (error) {
      this.loggerService.error(error);
    }
  }
}