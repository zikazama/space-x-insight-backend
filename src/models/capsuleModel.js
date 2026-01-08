const db = require("../../db");
const BaseModel = require("./baseModel");
const { resolveDateInfo } = require("../utils/dateUtils");

class CapsuleModel extends BaseModel {
  constructor() {
    super("capsules");
  }

  create(data) {
    const { name, category, type, date, date_utc, status, reuse_count, water_landings, land_landings, last_update, details } = data;
    const dateInfo = resolveDateInfo(date_utc || date || last_update);

    const now = new Date().toISOString();
    const id = require("crypto").randomUUID();

    db.prepare(
      `INSERT INTO capsules (id, name, type, category, date_utc, date_day, status, reuse_count, water_landings, land_landings, last_update, details, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, name.trim(), type || "Unknown", category.trim(), dateInfo.date_utc, dateInfo.date_day, status || null, reuse_count || 0, water_landings || 0, land_landings || 0, last_update || null, details || null, "manual", now, now);

    return { id };
  }

  update(id, data) {
    const existing = db.prepare(`SELECT id, date_utc, date_day FROM capsules WHERE id = ?`).get(id);
    if (!existing) return null;

    const { name, category, type, date, date_utc, status, reuse_count, water_landings, land_landings, last_update, details } = data;
    const dateInfo = resolveDateInfo(date_utc || date || last_update, existing);

    const now = new Date().toISOString();

    db.prepare(
      `UPDATE capsules SET name = ?, type = ?, category = ?, date_utc = ?, date_day = ?, status = ?, reuse_count = ?, water_landings = ?, land_landings = ?, last_update = ?, details = ?, updated_at = ? WHERE id = ?`
    ).run(name.trim(), type || "Unknown", category.trim(), dateInfo.date_utc, dateInfo.date_day, status || null, reuse_count || 0, water_landings || 0, land_landings || 0, last_update || null, details || null, now, id);

    return { id };
  }

  upsertFromApi(record, now) {
    const selectStmt = db.prepare("SELECT name, type, category, date_utc, date_day, status, reuse_count, water_landings, land_landings, last_update, details FROM capsules WHERE id = ?");
    const insertStmt = db.prepare(
      `INSERT INTO capsules (id, name, type, category, date_utc, date_day, status, reuse_count, water_landings, land_landings, last_update, details, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const updateStmt = db.prepare(
      `UPDATE capsules SET name = ?, type = ?, category = ?, date_utc = ?, date_day = ?, status = ?, reuse_count = ?, water_landings = ?, land_landings = ?, last_update = ?, details = ?, source = ?, updated_at = ? WHERE id = ?`
    );

    const existing = selectStmt.get(record.id);

    if (!existing) {
      insertStmt.run(record.id, record.name, record.type, record.category, record.date_utc, record.date_day, record.status, record.reuse_count, record.water_landings, record.land_landings, record.last_update, record.details, "spacex", now, now);
      return "inserted";
    }

    const changed =
      existing.name !== record.name ||
      existing.category !== record.category ||
      existing.date_utc !== record.date_utc ||
      existing.date_day !== record.date_day ||
      (existing.status || "") !== (record.status || "") ||
      existing.reuse_count !== record.reuse_count ||
      existing.water_landings !== record.water_landings ||
      existing.land_landings !== record.land_landings ||
      (existing.last_update || "") !== (record.last_update || "") ||
      (existing.details || "") !== (record.details || "");

    if (changed) {
      updateStmt.run(record.name, record.type, record.category, record.date_utc, record.date_day, record.status, record.reuse_count, record.water_landings, record.land_landings, record.last_update, record.details, "spacex", now, record.id);
      return "updated";
    }

    return "skipped";
  }
}

module.exports = new CapsuleModel();
