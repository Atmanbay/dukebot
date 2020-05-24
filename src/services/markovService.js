export default class MarkovService {
  constructor(services) {
    this.databaseService = services.databaseService;
    this.loggerService = services.loggerService;
  }
}