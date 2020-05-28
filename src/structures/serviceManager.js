const awilix = require('awilix');

export default class ServiceManager {
  constructor(guild) {
    this.guild = guild;
  }

  build() {
    let container = awilix.createContainer();
    container.register({
      guild: awilix.asValue(this.guild)
    });

    container.loadModules(__dirname + '/../services/**/*.js', {
      formatName: 'camelCase',
      resolverOptions: {
        lifetime: awilix.Lifetime.SINGLETON,
        register: awilix.asClass
      }
    });

    return container;
  }
}