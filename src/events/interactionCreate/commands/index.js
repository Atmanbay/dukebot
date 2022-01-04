const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const hash = require("object-hash");

module.exports = class {
  constructor(services) {
    this.configService = services.config;
    this.loggingService = services.logging;
    this.buttonService = services.button;
    let commands = services.database.get("commands");

    this.commands = services.file.getClasses("./*.handler.js", __dirname);

    let slashCommandJson = Object.values(this.commands).map((instance) => {
      let scjson = instance.getSlashCommand.toJSON();
      return scjson;
    });

    let slashCommandHash = hash(slashCommandJson);

    if (commands.value().hash !== slashCommandHash) {
      const rest = new REST({ version: "9" }).setToken(services.config.token);
      (async () => {
        try {
          this.loggingService.info(
            "Started refreshing application (/) commands."
          );

          await rest.put(
            Routes.applicationGuildCommands(
              services.config.clientId,
              services.values.guild.id
            ),
            {
              body: slashCommandJson,
            }
          );

          commands.assign({ hash: slashCommandHash }).write();
          this.loggingService.info(
            "Successfully reloaded application (/) commands."
          );
        } catch (error) {
          this.loggingService.error(error);
        }
      })();
    } else {
      this.loggingService.info("Slash commands are up-to-date");
    }
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
