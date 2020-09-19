import Markov from 'markov-strings';

export default class MarkovService {
  constructor(container) {
    this.loggerService = container.loggerService;
  }

  buildMarkov(messages, variance) {
    let markov = new Markov(messages, { stateSize: 2 });
    markov.buildCorpus();

    let options = {
      maxTries: 100,
      prng: Math.random,
      filter: (result) => {
        return result.refs.length > variance
      }
    };

    try {
      let result = markov.generate(options);
      return result.string;
    } catch (error) {
      this.loggerService.error(error);
      return 'Failed to build Markov';
    }
  }
}