import { defaults } from 'lodash';

export default class EventHandler {
  constructor() {
    // let actual = defaults(options || {}, {
    //   event: '',
    //   buildServices: this.buildServices,
    //   handle: this.handle
    // });

    // this.event = actual.event;
    // this.handle = actual.handle;

    // let me = this;
    // let services = actual.buildServices();
    // Object.keys(services).forEach((key) => {
    //   me[key] = services[key];
    // })
  }
  
  buildServices() { }

  handle(event) { }
}