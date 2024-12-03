const Database = require("better-sqlite3");
const db = new Database("database.db", { verbose: console.log });

// Ensure the solderResult column exists
try {
  db.exec(`
    ALTER TABLE forms ADD COLUMN solderResult TEXT DEFAULT '';
  `);
} catch (error) {
  console.log('Column already exists or another error:', error.message);
}

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
    stopTime TEXT,
    solderResult TEXT DEFAULT ''
  );
`);

db.exec(`
  UPDATE forms
  SET solderResult = '-'
  WHERE solderResult IS NULL OR solderResult = '';
`);

module.exports = db;
