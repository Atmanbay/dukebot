const awilix = require("awilix");

export default class {
  buildEvents(options) {
    let services = awilix.createContainer();
    services.register({
      values: awilix.asValue(options),
    });

    services.loadModules(`${__dirname}/../services/**/*.js`, {
      formatName: "camelCase",
      resolverOptions: {
        lifetime: awilix.Lifetime.SINGLETON,
        register: awilix.asClass,
      },
    });

    let events = services.cradle.file.getClasses("*/index.js", __dirname);

    return events;
  }
}
