const db = require("../../db");
const { getConfig, SYNC_LOCK_KEY, SYNC_LOCK_TIMEOUT_MS } = require("../config/dataTypes");

function isSyncLocked() {
  const row = db.prepare("SELECT value FROM sync_meta WHERE key = ?").get(SYNC_LOCK_KEY);
  if (!row) return false;

  const lockTime = new Date(row.value).getTime();
  const now = Date.now();

  if (now - lockTime > SYNC_LOCK_TIMEOUT_MS) {
    releaseSyncLock();
    return false;
  }

  return true;
}

function acquireSyncLock() {
  if (isSyncLocked()) return false;

  db.prepare(
    `INSERT INTO sync_meta (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(SYNC_LOCK_KEY, new Date().toISOString());

  return true;
}

function releaseSyncLock() {
  db.prepare("DELETE FROM sync_meta WHERE key = ?").run(SYNC_LOCK_KEY);
}

function getLastSync(dataType) {
  const config = getConfig(dataType);
  if (!config) return null;

  const row = db.prepare("SELECT value FROM sync_meta WHERE key = ?").get(config.syncKey);
  return row ? row.value : null;
}

function setLastSync(dataType, isoTime) {
  const config = getConfig(dataType);
  if (!config) return;

  db.prepare(
    `INSERT INTO sync_meta (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(config.syncKey, isoTime);
}

module.exports = {
  isSyncLocked,
  acquireSyncLock,
  releaseSyncLock,
  getLastSync,
  setLastSync,
};
