export default class {
  constructor(services) {
    this.configService = services.config;
  }

  commandHelp(commandName, command) {
    let commandDetails = command.details;
    let response = [];
    response.push(`**Name:** ${commandName}`);
    response.push(`**Description:** ${commandDetails.description}`);
    if (commandDetails.args) {
      response.push(
        `**Arguments:** (all arguments can be called with just their first letter as well)`
      );
      let keys = commandDetails.args.$_terms.keys;
      keys.forEach((key) => {
        let schema = key.schema;

        let argument = {
          name: key.key,
        };

        if (schema._flags.presence && schema._flags.presence === "required") {
          argument.required = true;
        }

        if (schema.$_terms.notes && schema.$_terms.notes.length) {
          argument.notes = schema.$_terms.notes[0];
        }

        let argumentString = `   - **${argument.name}:** ${argument.notes}`;
        if (argument.required) {
          argumentString += " (required)";
        }
        response.push(argumentString);
      });
    }

    return {
      message: response,
      args: {
        text: response,
      },
    };
  }
}
