import Command from '../objects/command';


export default class DefineCommand extends Command {
  constructor(container) {
    super();
    this.defineService = container.defineService;
    this.details = {
      name: 'define',
      description: 'Use UrbanDictionary to find the definition of a word',
      args: [
        {
          name: 'w',
          description: 'Word to define',
          optional: false
        }
      ]
    };
  }

  execute(message, args) {
    if (!args.w) {
      return;
    }

    this.defineService
      .define(args.w)
      .then((definition) => {
        if (!definition) {
          message.channel.send('No definitions found');
          return;
        }

        let response = [];
        response.push(`**${args.w}**`);
        response.push('');
        response.push(definition.definition);
        response.push('');
        response.push(`_${definition.example}_`);

        message.channel.send(response);
      });
  }
}