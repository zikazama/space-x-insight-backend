const { getModel, syncModel } = require("../models");
const { getConfig } = require("../config/dataTypes");
const { fetchWithRetry } = require("../utils/httpClient");
const { log } = require("../utils/logger");
const { parseDate, resolveDateInfo, yearToDate } = require("../utils/dateUtils");

async function syncDataType(dataType) {
  const config = getConfig(dataType);
  if (!config) {
    throw new Error("Invalid data type");
  }

  const syncStartTime = Date.now();

  if (!syncModel.acquireSyncLock()) {
    throw new Error("Sync already in progress");
  }

  try {
    log("INFO", `Starting sync for ${dataType}`);

    const response = await fetchWithRetry(
      config.apiUrl,
      { method: "GET", headers: { "Content-Type": "application/json" } },
      3,
      30000
    );

    if (!response.ok) {
      const text = await response.text();
      log("ERROR", `SpaceX ${dataType} API error`, { status: response.status });
      throw new Error(`failed to fetch ${dataType}: ${text.slice(0, 200)}`);
    }

    const apiData = await response.json();
    const docs = Array.isArray(apiData) ? apiData : [];

    log("INFO", "API response", { dataType, count: docs.length });

    const now = new Date().toISOString();
    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    const model = getModel(dataType);

    if (dataType === "launches") {
      const rocketMap = await fetchRocketMap();

      for (const doc of docs) {
        if (!doc || !doc.id || !doc.date_utc) continue;
        const dateInfo = parseDate(doc.date_utc);
        if (!dateInfo) continue;

        const rocketName = typeof doc.rocket === "string"
          ? (rocketMap[doc.rocket] || "Unknown")
          : (doc.rocket?.name || "Unknown");

        const record = {
          id: doc.id,
          name: doc.name || "Unknown",
          date_utc: dateInfo.date_utc,
          date_day: dateInfo.date_day,
          category: rocketName,
          success: doc.success === null || doc.success === undefined ? null : doc.success ? 1 : 0,
          details: doc.details || null,
        };

        const result = model.upsertFromApi(record, now);
        if (result === "inserted") inserted++;
        else if (result === "updated") updated++;
        else skipped++;
      }
    } else if (dataType === "ships") {
      for (const doc of docs) {
        if (!doc || !doc.id) continue;
        const dateInfo = resolveDateInfo(yearToDate(doc.year_built));

        const record = {
          id: doc.id,
          name: doc.name || "Unknown",
          type: doc.type || "Unknown",
          category: (doc.roles && doc.roles[0]) || "Unknown",
          date_utc: dateInfo.date_utc,
          date_day: dateInfo.date_day,
          active: doc.active ? 1 : 0,
          home_port: doc.home_port || null,
          year_built: doc.year_built || null,
          details: doc.link || doc.url || null,
        };

        const result = model.upsertFromApi(record, now);
        if (result === "inserted") inserted++;
        else if (result === "updated") updated++;
        else skipped++;
      }
    } else if (dataType === "rockets") {
      for (const doc of docs) {
        if (!doc || !doc.id) continue;
        const dateInfo = resolveDateInfo(doc.first_flight);

        const record = {
          id: doc.id,
          name: doc.name || "Unknown",
          type: doc.type || "Unknown",
          category: doc.name || "Unknown",
          date_utc: dateInfo.date_utc,
          date_day: dateInfo.date_day,
          active: doc.active ? 1 : 0,
          stages: doc.stages || null,
          boosters: doc.boosters || null,
          cost_per_launch: doc.cost_per_launch || null,
          success_rate: doc.success_rate_pct || null,
          first_flight: doc.first_flight || null,
          details: doc.description || null,
        };

        const result = model.upsertFromApi(record, now);
        if (result === "inserted") inserted++;
        else if (result === "updated") updated++;
        else skipped++;
      }
    } else if (dataType === "capsules") {
      for (const doc of docs) {
        if (!doc || !doc.id) continue;
        const dateInfo = resolveDateInfo(doc.last_update);

        const record = {
          id: doc.id,
          name: doc.serial || "Unknown",
          type: doc.type || "Unknown",
          category: doc.type || "Dragon",
          date_utc: dateInfo.date_utc,
          date_day: dateInfo.date_day,
          status: doc.status || null,
          reuse_count: doc.reuse_count || 0,
          water_landings: doc.water_landings || 0,
          land_landings: doc.land_landings || 0,
          last_update: doc.last_update || null,
          details: null,
        };

        const result = model.upsertFromApi(record, now);
        if (result === "inserted") inserted++;
        else if (result === "updated") updated++;
        else skipped++;
      }
    } else if (dataType === "history") {
      for (const doc of docs) {
        if (!doc || !doc.id || !doc.event_date_utc) continue;
        const dateInfo = parseDate(doc.event_date_utc);
        if (!dateInfo) continue;

        const record = {
          id: doc.id,
          name: doc.title || "Unknown",
          date_utc: dateInfo.date_utc,
          date_day: dateInfo.date_day,
          category: "Historical Event",
          flight_number: doc.flight_number || null,
          details: doc.details || null,
        };

        const result = model.upsertFromApi(record, now);
        if (result === "inserted") inserted++;
        else if (result === "updated") updated++;
        else skipped++;
      }
    } else if (dataType === "launchpads") {
      for (const doc of docs) {
        if (!doc || !doc.id) continue;
        const dateInfo = resolveDateInfo(null);

        const record = {
          id: doc.id,
          name: doc.name || "Unknown",
          full_name: doc.full_name || null,
          locality: doc.locality || null,
          region: doc.region || null,
          category: doc.region || "Unknown",
          date_utc: dateInfo.date_utc,
          date_day: dateInfo.date_day,
          status: doc.status || null,
          launch_attempts: doc.launch_attempts || 0,
          launch_successes: doc.launch_successes || 0,
          latitude: doc.latitude || null,
          longitude: doc.longitude || null,
          details: doc.details || null,
        };

        const result = model.upsertFromApi(record, now);
        if (result === "inserted") inserted++;
        else if (result === "updated") updated++;
        else skipped++;
      }
    }

    syncModel.setLastSync(dataType, now);
    syncModel.releaseSyncLock();

    const duration = Date.now() - syncStartTime;
    log("INFO", "Sync completed", { dataType, inserted, updated, skipped, totalFetched: docs.length, durationMs: duration });

    return {
      dataType,
      inserted,
      updated,
      skipped,
      lastSync: now,
      totalFetched: docs.length,
      durationMs: duration,
    };
  } catch (error) {
    syncModel.releaseSyncLock();
    log("ERROR", "Sync failed", { dataType, error: error.message });
    throw error;
  }
}

async function fetchRocketMap() {
  try {
    const response = await fetchWithRetry(
      "https://api.spacexdata.com/v4/rockets",
      { method: "GET", headers: { "Content-Type": "application/json" } },
      3,
      30000
    );

    if (response.ok) {
      const rocketsData = await response.json();
      return rocketsData.reduce((acc, r) => {
        acc[r.id] = r.name;
        return acc;
      }, {});
    }
  } catch (error) {
    log("WARN", "Failed to fetch rockets for mapping", { error: error.message });
  }
  return {};
}

function getSyncStatus() {
  const { getAllDataTypes } = require("../config/dataTypes");
  const status = {};

  getAllDataTypes().forEach((type) => {
    status[type] = syncModel.getLastSync(type);
  });

  return {
    isLocked: syncModel.isSyncLocked(),
    lastSync: status,
  };
}

module.exports = {
  syncDataType,
  getSyncStatus,
};
