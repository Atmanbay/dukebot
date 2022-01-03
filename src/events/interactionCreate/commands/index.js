const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

module.exports = class {
  constructor(services) {
    this.configService = services.config;
    this.loggingService = services.logging;
    this.buttonService = services.button;

    this.commands = services.file.getClasses("./*.handler.js", __dirname);

    // let slashCommandJson = Object.values(this.commands).map((instance) => {
    //   let scjson = instance.getSlashCommand.toJSON();
    //   return scjson;
    // });

    // const rest = new REST({ version: "9" }).setToken(services.config.token);
    // (async () => {
    //   try {
    //     console.log("Started refreshing application (/) commands.");

    //     await rest.put(
    //       Routes.applicationGuildCommands(
    //         services.config.clientId,
    //         services.values.guild.id
    //       ),
    //       {
    //         body: slashCommandJson,
    //       }
    //     );

    //     console.log("Successfully reloaded application (/) commands.");
    //   } catch (error) {
    //     console.error(error);
    //   }
    // })();
  }

  async handle(interaction) {
    try {
      if (interaction.isCommand()) {
        let command = this.commands[`${interaction.commandName}.handler`];
        if (!command) {
          return;
        }

        await command.execute(interaction);
      } else if (interaction.isButton()) {
        this.buttonService.handle(interaction);
      }
    } catch (error) {
      this.loggingService.error(error);
    }
  }
};
