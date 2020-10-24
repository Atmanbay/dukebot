import Markov from 'markov-strings';

export default class MarkovService {
  constructor(container) {
    this.loggerService = container.loggerService;
  }

  buildMarkov({messages, stateSize, maxTries, variance}) {
    return 'this is a markov';
    // let markov = new Markov(messages, { stateSize: stateSize });
    // markov.buildCorpus();

    // let options = {
    //   maxTries: maxTries,
    //   prng: Math.random,
    //   filter: (result) => {
    //     return result.refs.length > variance && result.string.length <= 2000
    //   }
    // };

    // try {
    //   let result = markov.generate(options);
    //   return result.string;
    // } catch (error) {
    //   this.loggerService.error(error);
    //   return 'Failed to build Markov';
    // }
  }
}