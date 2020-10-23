import { filter, sample, some } from 'lodash';

export default class AcronymService {
  constructor(container) {
    this.loggerService = container.loggerService;
    this.messageHistoryService = container.messageHistoryService;
  }

  async acronymize(word) {
    try {
      let messages = await this.messageHistoryService.fetchMessages();
      let wordObjects = [];
      messages.forEach(m => {
        m.split(' ').forEach(w => {
          wordObjects.push({
            letter: w[0].toLowerCase(),
            word: w[0].toUpperCase() + w.substring(1)
          });
        });
      });

      let response = word.split('').map(letter => {
        try {
          let matchingWords = filter(wordObjects, { letter: letter.toLowerCase() }); // get all matching words
          let result = sample(matchingWords.map(mw => mw)); // get a random element
          if (!result) {
            return null;
          }
          let trimmedWord = result.word.match(/\w+/)[0];
          return `**${letter.toUpperCase()}:** ${trimmedWord}`;
        } catch (error) {
          this.loggerService.error(error);
        }
      });

      if (some(response, r => !r)) {
        return 'Acronym could not be built';
      }

      return response;
    } catch (error) {
      this.loggerService.error(error);
    }
  }
}