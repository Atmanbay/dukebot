import fs from "fs";
import FileSync from "lowdb/adapters/FileSync";
import low from "lowdb";

// Used to access the guild-specific JSON db
export default class DatabaseService {
  constructor(container) {
    this.dbFolder = container.configService.paths.database;
    this.configService = container.configService;
    let guildId = container.guildService.guild.id;

    this.generateDb(guildId);

    let db = this.buildDb(guildId);
    this.get = db.get.bind(db);
  }

  generateDb(dbName) {
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
}
