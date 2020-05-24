export default class JobsService {
  constructor(services) {
    this.databaseService = services.databaseService;
    this.loggerService = services.loggerService;
  }
}