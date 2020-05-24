const awilix = require('awilix');

export default class InjectionManager {
  build() {
    let container = awilix.createContainer();
    container.loadModules(__dirname + '/../services/**/*.js', {
      formatName: 'camelCase',
      lifetime: awilix.Lifetime.SINGLETON,
      register: awilix.asClass
    });

    // let commands = container.createScope();
    // commands.loadModules(__dirname + '/../commands/**/*.js', {
    //   formatName: 'camelCase',
    //   lifetime: awilix.Lifetime.SINGLETON,
    //   register: awilix.asClass
    // });

    // let triggers = container.createScope();
    // triggers.loadModules(__dirname + '/../triggers/**/*.js', {
    //   formatName: 'camelCase',
    //   lifetime: awilix.Lifetime.SINGLETON,
    //   register: awilix.asClass
    // });

    // container.resolve('commandService').load(commands);
    // container.resolve('triggerService').load(triggers);

    return container;
  }
}