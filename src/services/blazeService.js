export default class BlazeService {
  constructor(services) {
    this.databaseService = services.databaseService;
    this.loggerService = services.loggerService;
  }
}