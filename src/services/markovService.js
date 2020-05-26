export default class MarkovService {
  constructor(services) {
    this.db = services.databaseService.get('messages');
    this.loggerService = services.loggerService;
  }

  buildMarkov(userId) {
    let messageHistoryUser = this.db.find({ id: userId });
    if (isEmpty(messageHistoryUser.value())) {
      return Promise.reject(`No message history for userId ${userId}`);
    }

    let messages = messageHistoryUser.value().messages;
    let markov = new Markov(messages, {stateSize: 2});
    markov.buildCorpus();

    let options = {
      maxTries: 10,
      prng: Math.random
    }

    return Promise.resolve(markov.generate(options).string);
  }
}