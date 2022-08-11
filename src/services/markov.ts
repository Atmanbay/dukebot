import Markov, { MarkovGenerateOptions } from "markov-strings";

export const buildMarkov = ({
  messages,
  stateSize,
  maxTries,
  variance,
}: {
  messages: string[];
  stateSize: number;
  maxTries: number;
  variance: number;
}) => {
  let markov = new Markov(messages, { stateSize });
  markov.buildCorpus();

  let options: MarkovGenerateOptions = {
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

  let result = markov.generate(options);
  return result.string;
};
