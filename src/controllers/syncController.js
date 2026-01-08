const syncService = require("../services/syncService");
const { log } = require("../utils/logger");

async function syncDataType(req, res) {
  try {
    const { dataType } = req.params;
    const result = await syncService.syncDataType(dataType);
    res.json(result);
  } catch (error) {
    if (error.message === "Invalid data type") {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "Sync already in progress") {
      return res.status(409).json({ error: error.message });
    }
    log("ERROR", "Sync endpoint error", { error: error.message });
    res.status(500).json({ error: "Sync failed" });
  }
}

function getSyncStatus(req, res) {
  try {
    const status = syncService.getSyncStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  syncDataType,
  getSyncStatus,
};
