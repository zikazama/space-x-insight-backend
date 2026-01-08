const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const CURRENT_LOG_LEVEL = LOG_LEVELS.INFO;

function log(level, message, meta = {}) {
  if (LOG_LEVELS[level] < CURRENT_LOG_LEVEL) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  console.log(JSON.stringify(entry));
}

module.exports = { log, LOG_LEVELS };
