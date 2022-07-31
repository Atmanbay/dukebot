// const request = require("request-promise-native");
// const HTMLParser = require("node-html-parser");
// const decode = require("decode-html");

import request from "request-promise-native";
import { parse } from "node-html-parser";
import { sample } from "lodash";

const entities: {
  [key: string]: string;
} = {
  amp: "&",
  apos: "'",
  lt: "<",
  gt: ">",
  quot: '"',
  nbsp: "\xa0",
};
const entityPattern = /&([a-z]+);/gi;

const decode = (text: string): string => {
  return text.replace(entityPattern, function (match, entity) {
    entity = entity.toLowerCase();
    if (entities.hasOwnProperty(entity)) {
      return entities[entity];
    }
    // return original string if there is no matching entity (no replace)
    return match;
  });
};

module.exports = class {
  async define(word: string) {
    let escapedWord = encodeURI(word);
    let url = `https://www.urbandictionary.com/define.php?term=${escapedWord}`;

    let htmlString = await request(url);
    let root = parse(htmlString);

    let definitions = root.querySelectorAll(".definition");
    if (definitions.length === 0) {
      return null;
    }

    let randomDefinition = sample(definitions);

    let definition = randomDefinition.querySelector("div.meaning");
    let example = randomDefinition.querySelector("div.example");

    return {
      definition: decode(definition.structuredText),
      example: decode(example.structuredText),
    };
  }
};
