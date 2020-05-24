import fs from 'fs';
import FileSync from 'lowdb/adapters/FileSync';
import low from 'lowdb';

export default class DatabaseService {
  constructor(services) {
    this.databases = {};
    this.dbFolder = services.configService.directories.database;
    this.configService = services.configService;
  }

  generateDbFile(dbName) {
    let fileName = `${this.dbFolder}/${dbName}.json`;
    fs.closeSync(fs.openSync(fileName, 'a'));
  }

  get(dbName) {
    if (this.databases[dbName]) {
      return this.databases[dbName];
    }

    let fileName = `${this.dbFolder}/${dbName}.json`;
    let adapter = new FileSync(fileName);
    let db = low(adapter);

    db.defaults(this.configService.dbDefaults).write();

    this.databases[dbName] = db;
    return this.databases[dbName];
  }
}