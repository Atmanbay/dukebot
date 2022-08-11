import request from "request-promise-native";
import { parse } from "node-html-parser";
import { sample } from "lodash-es";

const decodings: {
  [key: string]: string;
} = {
  amp: "&",
  apos: "'",
  lt: "<",
  gt: ">",
  quot: '"',
  nbsp: "\xa0",
};
const decodePattern = /&([a-z]+);/gi;

const decode = (text: string): string => {
  return text.replace(decodePattern, function (match, entity) {
    entity = entity.toLowerCase();
    if (decodings.hasOwnProperty(entity)) {
      return decodings[entity];
    }

    return match;
  });
};

export const define = async (word: string) => {
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
};
