import { filter, sample, some } from "lodash";

export default class {
  constructor(services) {
    this.loggerService = services.logger;
    this.messageHistoryService = services.messageHistory;
  }

  async acronymize(word) {
    try {
      let messages = await this.messageHistoryService.fetchMessages();
      let wordObjects = [];
      messages.forEach((m) => {
        m.split(" ")
          .filter((w) => w)
          .forEach((w) => {
            wordObjects.push({
              letter: w[0].toLowerCase(),
              word: w[0].toUpperCase() + w.substring(1),
            });
          });
      });

      let response = word.split("").map((letter) => {
        let matchingWords = filter(wordObjects, {
          letter: letter.toLowerCase(),
        }); // get all matching words
        let result = sample(matchingWords.map((mw) => mw)); // get a random element
        if (!result) {
          return null;
        }
        let trimmedWord = result.word.match(/\w+/)[0];
        return `**${letter.toUpperCase()}:** ${trimmedWord}`;
      });

      if (some(response, (r) => !r)) {
        return "Acronym could not be built";
      }

      return response;
    } catch (error) {
      this.loggerService.error("Error when acronymizing", error);
    }
  }
}
