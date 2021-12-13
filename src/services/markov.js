const Markov = require("markov-strings").default;

module.exports = class {
  constructor(services) {
    this.loggingService = services.logging;
  }

  buildMarkov({ messages, stateSize, maxTries, variance }) {
    let markov = new Markov(messages, { stateSize: stateSize });
    markov.buildCorpus();

    let options = {
      maxTries: maxTries,
      prng: Math.random,
      filter: (result) => {
        return (
          result.refs.length > variance &&
          result.score > 1 &&
          result.string.length <= 2000
        );
      },
    };

    try {
      let result = markov.generate(options);
      return result.string;
    } catch (error) {
      this.loggingService.error(error);
      return "Failed to build Markov";
    }
  }
};
