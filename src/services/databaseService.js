import fs from 'fs';
import FileSync from 'lowdb/adapters/FileSync';
import low from 'lowdb';

export default class DatabaseService {
  constructor(container) {
    this.dbFolder = container.configService.directories.database;
    this.configService = container.configService;
    // this.guild = container.guild; TODO

    // this.generateDb(this.guild.id);

    // let db = this.buildDb(this.guild.id);
    // this.get = db.get.bind(db);
  }

  get(name) {
    return null;
  }

  generateDb(dbName) {
    let fileName = `${this.dbFolder}/${dbName}.json`;
    fs.closeSync(fs.openSync(fileName, 'a'));
  }

  buildDb(dbName) {
    let fileName = `${this.dbFolder}/${dbName}.json`;
    let adapter = new FileSync(fileName);
    let db = low(adapter);

    db.defaults(this.configService.dbDefaults).write();

    return db;
  }
}