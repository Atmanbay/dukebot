import request from 'request-promise-native';
import { parse } from 'node-html-parser';

export default class AcronymService {
  constructor(container) {
    this.loggerService = container.loggerService;
  }

  async acronymize(word) {
    try {
      let url = 'https://acronym-maker.com/generate/';
      let queryParams = {
        w: word.replace(/[^\w]|\d/g, '')
      }

      let htmlString = await request({
        url: url,
        qs: queryParams
      });

      let root = parse(htmlString);
      let wordNodes = root.querySelectorAll('table tr');
      if (!wordNodes || wordNodes.length === 0) {
        return 'Could not create acronym. Are there special characters?';
      }

      return wordNodes.map(wn => {
        let word = wn.attributes["data-word"];
        word = word[0].toUpperCase() + word.substring(1);
        
        let letter = word[0];

        return `**${letter}**: ${word}`;
      });
    } catch (error) {
      this.loggerService.error(error);
    }
  }
}