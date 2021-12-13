const fs = require("fs");
const FileSync = require("lowdb/adapters/FileSync");
const low = require("lowdb");

// Used to access the guild-specific JSON db
module.exports = class {
  constructor(services) {
    this.dbFolder = services.config.paths.database;
    this.configService = services.config;
    this.databases = {};

    // services.guilds.forEach((guild) => {
    //   this.createDbFile(guild.guild.id);
    //   let db = this.buildDb(guild.guild.id);

    //   //databaseService.databases[guildId].get("tableName");
    //   this.databases[guild.guild.id] = {
    //     get: db.get.bind(db),
    //   };
    // });

    this.createDbFile(services.values.guild.id);

    let db = this.buildDb(services.values.guild.id);
    this.get = db.get.bind(db);
  }

  createDbFile(dbName) {
    let fileName = `${this.dbFolder}/${dbName}.json`;
    fs.closeSync(fs.openSync(fileName, "a"));
  }

  buildDb(dbName) {
    let fileName = `${this.dbFolder}/${dbName}.json`;
    let adapter = new FileSync(fileName);
    let db = low(adapter);

    db.defaults(this.configService.dbDefaults).write();

    return db;
  }
};
