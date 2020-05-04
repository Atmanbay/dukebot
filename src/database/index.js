const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
import { sync } from 'glob';
import { find } from 'lodash';

export default class Database {
  constructor() {
    let me = this;
    let files = sync('**/*.json', { cwd: `${__dirname}/` });
    files.forEach((fileName) => {
      let adapter = new FileSync(`${__dirname}/${fileName}`);
      let db = low(adapter);

      let collectionName = fileName.replace('.json', '');
      me[collectionName] = db.get(collectionName);
    });
  }

  getCollection(name) {
    return find(this.collections, { 'name': name }).collection;
  }
}