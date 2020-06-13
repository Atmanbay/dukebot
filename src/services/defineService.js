import request from 'request-promise-native';
import { parse } from 'node-html-parser';
import decode from 'decode-html';

export default class DefineService {
  constructor(container) {
    this.loggerService = container.loggerService;
  }

  define(word) {
    let escapedWord = encodeURI(word);
    let url = `https://www.urbandictionary.com/define.php?term=${escapedWord}`;
    return request(url)
      .then((htmlString) => {
        let root = parse(htmlString);
        let topDefinition = root.querySelector('.def-panel ').parentNode;
        if (!topDefinition) {
          return null;
        }

        let definition = topDefinition.querySelector('div.meaning');
        let example = topDefinition.querySelector('div.example');

        return {
          definition: decode(definition.structuredText),
          example: decode(example.structuredText)
        };
      })
      .catch((error) => {
        this.loggerService.error(`Error when requesting url ${url}`, error);
      });
  }
}