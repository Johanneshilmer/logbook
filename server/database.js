const Database = require("better-sqlite3");
const db = new Database("database.db", { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent TEXT,
    name TEXT,
    workOrder TEXT,
    program TEXT,
    radios TEXT,
    changeOver TEXT,
    workTime TEXT,
    solderTest INTEGER,
    comment TEXT,
    date TEXT,
    time TEXT,
    stopTime TEXT
  );
`);

module.exports = db;