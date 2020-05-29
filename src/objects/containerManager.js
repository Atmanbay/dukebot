const awilix = require('awilix');
import { sync } from 'glob';

export default class ContainerManager {
  constructor(guild, botUser) {
    this.guild = guild;
    this.botUser = botUser;
  }

  build() {
    let container = awilix.createContainer();
    container.register({
      guild: awilix.asValue(this.guild),
      botUser: awilix.asValue(this.botUser)
    });

    container.loadModules(`${__dirname}/../services/**/*.js`, {
      formatName: 'camelCase',
      resolverOptions: {
        lifetime: awilix.Lifetime.SINGLETON,
        register: awilix.asClass
      }
    });

    let registerObject = {};
    let registeringDirectories = ['commands', 'triggers', 'eventHandlers'];
    registeringDirectories.forEach((directory) => {
      registerObject[directory] = this.registerDirectory(directory);
    });

    container.register(registerObject);

    return container;
  }

  registerDirectory(directoryPath) {
    let registeringArray = [];
    this.importDirectory(`${__dirname}/../${directoryPath}`).forEach((imported) => {
      registeringArray.push(awilix.asClass(imported, { lifetime: awilix.Lifetime.SINGLETON }));
    });

    return this.asArray(registeringArray);
  }

  importDirectory(path) {
    let files = sync('**/*.js', { cwd: `${path}/` });
    let imports = files.map(filename => require(`${path}/${filename}`).default);

    return imports;
  }

  asArray(resolvers) {
    return {
      resolve: (container, opts) => resolvers.map(r => container.build(r, opts))
    }
  }
}