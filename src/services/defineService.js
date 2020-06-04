import request from 'request-promise-native';
import { parse } from 'node-html-parser';
import decode from 'decode-html';
import fs from 'fs';

export default class DefineService {
  constructor(container) {

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

        let data = null;
        try {
          data = {
            definition: decode(definition.structuredText),
            example: decode(example.structuredText)
          };
        } catch (error) {
          console.log(error);
        }

        return data;
      })
      .catch((error) => {
        console.log(error);
      });
  }
}