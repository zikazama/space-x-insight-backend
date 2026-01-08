const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "data.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS launches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date_utc TEXT NOT NULL,
    date_day TEXT NOT NULL,
    category TEXT NOT NULL,
    success INTEGER,
    details TEXT,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ships (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    date_utc TEXT,
    date_day TEXT,
    active INTEGER,
    home_port TEXT,
    year_built INTEGER,
    details TEXT,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rockets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    date_utc TEXT,
    date_day TEXT,
    active INTEGER,
    stages INTEGER,
    boosters INTEGER,
    cost_per_launch INTEGER,
    success_rate INTEGER,
    first_flight TEXT,
    details TEXT,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS capsules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    date_utc TEXT,
    date_day TEXT,
    status TEXT,
    reuse_count INTEGER,
    water_landings INTEGER,
    land_landings INTEGER,
    last_update TEXT,
    details TEXT,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date_utc TEXT NOT NULL,
    date_day TEXT NOT NULL,
    category TEXT NOT NULL,
    flight_number INTEGER,
    details TEXT,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS launchpads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    full_name TEXT,
    locality TEXT,
    region TEXT,
    category TEXT NOT NULL,
    date_utc TEXT,
    date_day TEXT,
    status TEXT,
    launch_attempts INTEGER DEFAULT 0,
    launch_successes INTEGER DEFAULT 0,
    latitude REAL,
    longitude REAL,
    details TEXT,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sync_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

function ensureColumns(table, columns) {
  const existing = new Set(
    db.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name)
  );

  columns.forEach((column) => {
    if (!existing.has(column.name)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column.name} ${column.type}`);
    }
  });
}

ensureColumns("ships", [
  { name: "date_utc", type: "TEXT" },
  { name: "date_day", type: "TEXT" },
]);
ensureColumns("rockets", [
  { name: "date_utc", type: "TEXT" },
  { name: "date_day", type: "TEXT" },
]);
ensureColumns("capsules", [
  { name: "date_utc", type: "TEXT" },
  { name: "date_day", type: "TEXT" },
]);

db.exec(`
  UPDATE ships
  SET date_day = COALESCE(date_day, CASE WHEN year_built IS NOT NULL THEN printf('%04d-01-01', year_built) END, substr(created_at, 1, 10)),
      date_utc = COALESCE(date_utc, CASE WHEN year_built IS NOT NULL THEN printf('%04d-01-01T00:00:00.000Z', year_built) END, created_at)
  WHERE date_day IS NULL OR date_utc IS NULL;

  UPDATE rockets
  SET date_day = COALESCE(date_day, substr(first_flight, 1, 10), substr(created_at, 1, 10)),
      date_utc = COALESCE(date_utc, first_flight, created_at)
  WHERE date_day IS NULL OR date_utc IS NULL;

  UPDATE capsules
  SET date_day = COALESCE(date_day, substr(created_at, 1, 10)),
      date_utc = COALESCE(date_utc, created_at)
  WHERE date_day IS NULL OR date_utc IS NULL;
`);

module.exports = db;
