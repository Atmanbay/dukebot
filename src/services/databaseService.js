import config from '../../config.json'
import fs from 'fs';
import FileSync from 'lowdb/adapters/FileSync';
import low from 'lowdb';

export default class DatabaseService {
  constructor() {
    this.databases = {};
    this.dbFolder = `${__dirname}/../database`;
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

    db.defaults(config.dbDefaults).write();

    this.databases[dbName] = db;
    return this.databases[dbName];
  }
}