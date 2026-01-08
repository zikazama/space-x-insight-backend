const db = require("../../db");
const BaseModel = require("./baseModel");
const { resolveDateInfo } = require("../utils/dateUtils");

class LaunchpadModel extends BaseModel {
  constructor() {
    super("launchpads");
  }

  create(data) {
    const { name, full_name, locality, region, category, status, launch_attempts, launch_successes, latitude, longitude, details } = data;
    const dateInfo = resolveDateInfo(null);

    const now = new Date().toISOString();
    const id = require("crypto").randomUUID();

    db.prepare(
      `INSERT INTO launchpads (id, name, full_name, locality, region, category, date_utc, date_day, status, launch_attempts, launch_successes, latitude, longitude, details, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, name.trim(), full_name || null, locality || null, region || null, category.trim(), dateInfo.date_utc, dateInfo.date_day, status || null, launch_attempts || 0, launch_successes || 0, latitude || null, longitude || null, details || null, "manual", now, now);

    return { id };
  }

  update(id, data) {
    const existing = db.prepare(`SELECT id FROM launchpads WHERE id = ?`).get(id);
    if (!existing) return null;

    const { name, full_name, locality, region, category, status, launch_attempts, launch_successes, latitude, longitude, details } = data;
    const now = new Date().toISOString();

    db.prepare(
      `UPDATE launchpads SET name = ?, full_name = ?, locality = ?, region = ?, category = ?, status = ?, launch_attempts = ?, launch_successes = ?, latitude = ?, longitude = ?, details = ?, updated_at = ? WHERE id = ?`
    ).run(name.trim(), full_name || null, locality || null, region || null, category.trim(), status || null, launch_attempts || 0, launch_successes || 0, latitude || null, longitude || null, details || null, now, id);

    return { id };
  }

  upsertFromApi(record, now) {
    const selectStmt = db.prepare("SELECT name, full_name, locality, region, category, status, launch_attempts, launch_successes, latitude, longitude, details FROM launchpads WHERE id = ?");
    const insertStmt = db.prepare(
      `INSERT INTO launchpads (id, name, full_name, locality, region, category, date_utc, date_day, status, launch_attempts, launch_successes, latitude, longitude, details, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const updateStmt = db.prepare(
      `UPDATE launchpads SET name = ?, full_name = ?, locality = ?, region = ?, category = ?, status = ?, launch_attempts = ?, launch_successes = ?, latitude = ?, longitude = ?, details = ?, source = ?, updated_at = ? WHERE id = ?`
    );

    const existing = selectStmt.get(record.id);

    if (!existing) {
      insertStmt.run(record.id, record.name, record.full_name, record.locality, record.region, record.category, record.date_utc, record.date_day, record.status, record.launch_attempts, record.launch_successes, record.latitude, record.longitude, record.details, "spacex", now, now);
      return "inserted";
    }

    const changed =
      existing.name !== record.name ||
      (existing.full_name || "") !== (record.full_name || "") ||
      (existing.locality || "") !== (record.locality || "") ||
      (existing.region || "") !== (record.region || "") ||
      existing.category !== record.category ||
      (existing.status || "") !== (record.status || "") ||
      existing.launch_attempts !== record.launch_attempts ||
      existing.launch_successes !== record.launch_successes ||
      existing.latitude !== record.latitude ||
      existing.longitude !== record.longitude ||
      (existing.details || "") !== (record.details || "");

    if (changed) {
      updateStmt.run(record.name, record.full_name, record.locality, record.region, record.category, record.status, record.launch_attempts, record.launch_successes, record.latitude, record.longitude, record.details, "spacex", now, record.id);
      return "updated";
    }

    return "skipped";
  }

  getStatusDistribution() {
    return db
      .prepare(
        `SELECT status as label, COUNT(*) as value
         FROM launchpads
         GROUP BY status
         ORDER BY value DESC`
      )
      .all();
  }

  getRegionDistribution() {
    return db
      .prepare(
        `SELECT region as label, COUNT(*) as value
         FROM launchpads
         WHERE region IS NOT NULL
         GROUP BY region
         ORDER BY value DESC`
      )
      .all();
  }

  getLaunchStats() {
    return db
      .prepare(
        `SELECT name, launch_attempts as attempts, launch_successes as successes,
         CASE WHEN launch_attempts > 0 THEN ROUND(launch_successes * 100.0 / launch_attempts, 1) ELSE 0 END as success_rate
         FROM launchpads
         WHERE launch_attempts > 0
         ORDER BY launch_attempts DESC`
      )
      .all();
  }
}

module.exports = new LaunchpadModel();
