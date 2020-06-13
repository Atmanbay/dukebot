export default class MarkovService {
  constructor(container) {
    this.db = container.databaseService.get('messages');
    this.loggerService = container.loggerService;
  }

  buildMarkov(userId) {
    // return Promise.reject();
    // TODO: Rewrite using own logic instead of library
    // let messageHistoryUser = this.db.find({ id: userId });
    // if (isEmpty(messageHistoryUser.value())) {
    //   return Promise.reject(`No message history for userId ${userId}`);
    // }

    // let messages = messageHistoryUser.value().messages;
    // let markov = new Markov(messages, {stateSize: 2});
    // markov.buildCorpus();

    // let options = {
    //   maxTries: 10,
    //   prng: Math.random
    // }

    // return Promise.resolve(markov.generate(options).string);
  }
}