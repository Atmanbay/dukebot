const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

let fileName = 'db.json';
let adapter = new FileSync(`${__dirname}/${fileName}`);
let db = low(adapter);

export default db;