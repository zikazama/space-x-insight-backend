const db = require("../../db");
const { getModel } = require("../models");
const { syncModel } = require("../models");
const { getConfig } = require("../config/dataTypes");
const { defaultRange, calculateBucketType } = require("../utils/dateUtils");

function getAggregatedByDate(table, startDay, endDay) {
  const bucketType = calculateBucketType(startDay, endDay);

  if (bucketType === "daily") {
    return {
      bucketType,
      data: db
        .prepare(
          `SELECT date_day as date, COUNT(*) as count
           FROM ${table}
           WHERE date_day >= ? AND date_day <= ?
           GROUP BY date_day
           ORDER BY date_day ASC`
        )
        .all(startDay, endDay),
    };
  }

  if (bucketType === "weekly") {
    return {
      bucketType,
      data: db
        .prepare(
          `SELECT
             strftime('%Y-W%W', date_day) as date,
             COUNT(*) as count
           FROM ${table}
           WHERE date_day >= ? AND date_day <= ?
           GROUP BY strftime('%Y-W%W', date_day)
           ORDER BY date ASC`
        )
        .all(startDay, endDay),
    };
  }

  return {
    bucketType,
    data: db
      .prepare(
        `SELECT
           strftime('%Y-%m', date_day) as date,
           COUNT(*) as count
         FROM ${table}
         WHERE date_day >= ? AND date_day <= ?
         GROUP BY strftime('%Y-%m', date_day)
         ORDER BY date ASC`
      )
      .all(startDay, endDay),
  };
}

function getAnalytics(dataType, options = {}) {
  const config = getConfig(dataType);
  if (!config) {
    throw new Error("Invalid data type");
  }

  const model = getModel(dataType);
  const fallback = defaultRange();

  let startDay = options.start || fallback.startDay;
  let endDay = options.end || fallback.endDay;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDay)) startDay = fallback.startDay;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDay)) endDay = fallback.endDay;

  if (startDay > endDay) {
    const temp = startDay;
    startDay = endDay;
    endDay = temp;
  }

  const byCategory = model.getCategoryDistribution(startDay, endDay);

  let byDateResult = { bucketType: "none", data: [] };
  if (config.hasDate) {
    byDateResult = getAggregatedByDate(config.table, startDay, endDay);
  }

  const total = model.count();
  const inRange = model.countInRange(startDay, endDay);
  const topCategory = model.getTopCategory(startDay, endDay);
  const latest = model.getLatest();
  const lastSync = syncModel.getLastSync(dataType);

  const result = {
    dataType,
    range: { start: startDay, end: endDay },
    summary: {
      total,
      inRange,
      topCategory: topCategory || null,
      latest: latest || null,
      lastSync,
    },
    charts: {
      byCategory,
      byDate: byDateResult.data,
      bucketType: byDateResult.bucketType,
    },
  };

  if (dataType === "launchpads" && typeof model.getLaunchStats === "function") {
    result.charts.launchStats = model.getLaunchStats();
    result.charts.statusDistribution = model.getStatusDistribution();
  }

  return result;
}

module.exports = {
  getAnalytics,
};
