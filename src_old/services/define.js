const request = require("request-promise-native");
const HTMLParser = require("node-html-parser");
const decode = require("decode-html");

module.exports = class {
  async define(word) {
    let escapedWord = encodeURI(word);
    let url = `https://www.urbandictionary.com/define.php?term=${escapedWord}`;

    try {
      let htmlString = await request(url);
      let root = HTMLParser.parse(htmlString);

      // Not sure why I need to grab the parentNode here, quirk with the library or I'm dumb
      let topDefinition = root.querySelector(".definition").parentNode;
      if (!topDefinition) {
        return null;
      }

      let definition = topDefinition.querySelector("div.meaning");
      let example = topDefinition.querySelector("div.example");

      return {
        definition: decode(definition.structuredText),
        example: decode(example.structuredText),
      };
    } catch (error) {
      return null;
    }
  }
};
