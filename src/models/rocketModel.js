const db = require("../../db");
const BaseModel = require("./baseModel");
const { resolveDateInfo, normalizeSuccess } = require("../utils/dateUtils");

class RocketModel extends BaseModel {
  constructor() {
    super("rockets");
  }

  create(data) {
    const { name, category, type, date, date_utc, active, stages, boosters, cost_per_launch, success_rate, first_flight, details } = data;
    const dateInfo = resolveDateInfo(date_utc || date || first_flight);

    const now = new Date().toISOString();
    const id = require("crypto").randomUUID();

    db.prepare(
      `INSERT INTO rockets (id, name, type, category, date_utc, date_day, active, stages, boosters, cost_per_launch, success_rate, first_flight, details, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, name.trim(), type || "Unknown", category.trim(), dateInfo.date_utc, dateInfo.date_day, normalizeSuccess(active), stages || null, boosters || null, cost_per_launch || null, success_rate || null, first_flight || null, details || null, "manual", now, now);

    return { id };
  }

  update(id, data) {
    const existing = db.prepare(`SELECT id, date_utc, date_day FROM rockets WHERE id = ?`).get(id);
    if (!existing) return null;

    const { name, category, type, date, date_utc, active, stages, boosters, cost_per_launch, success_rate, first_flight, details } = data;
    const dateInfo = resolveDateInfo(date_utc || date || first_flight, existing);

    const now = new Date().toISOString();

    db.prepare(
      `UPDATE rockets SET name = ?, type = ?, category = ?, date_utc = ?, date_day = ?, active = ?, stages = ?, boosters = ?, cost_per_launch = ?, success_rate = ?, first_flight = ?, details = ?, updated_at = ? WHERE id = ?`
    ).run(name.trim(), type || "Unknown", category.trim(), dateInfo.date_utc, dateInfo.date_day, normalizeSuccess(active), stages || null, boosters || null, cost_per_launch || null, success_rate || null, first_flight || null, details || null, now, id);

    return { id };
  }

  upsertFromApi(record, now) {
    const selectStmt = db.prepare("SELECT name, type, category, date_utc, date_day, active, stages, boosters, cost_per_launch, success_rate, first_flight, details FROM rockets WHERE id = ?");
    const insertStmt = db.prepare(
      `INSERT INTO rockets (id, name, type, category, date_utc, date_day, active, stages, boosters, cost_per_launch, success_rate, first_flight, details, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const updateStmt = db.prepare(
      `UPDATE rockets SET name = ?, type = ?, category = ?, date_utc = ?, date_day = ?, active = ?, stages = ?, boosters = ?, cost_per_launch = ?, success_rate = ?, first_flight = ?, details = ?, source = ?, updated_at = ? WHERE id = ?`
    );

    const existing = selectStmt.get(record.id);

    if (!existing) {
      insertStmt.run(record.id, record.name, record.type, record.category, record.date_utc, record.date_day, record.active, record.stages, record.boosters, record.cost_per_launch, record.success_rate, record.first_flight, record.details, "spacex", now, now);
      return "inserted";
    }

    const changed =
      existing.name !== record.name ||
      existing.type !== record.type ||
      existing.category !== record.category ||
      existing.date_utc !== record.date_utc ||
      existing.date_day !== record.date_day ||
      existing.active !== record.active ||
      existing.stages !== record.stages ||
      existing.boosters !== record.boosters ||
      existing.cost_per_launch !== record.cost_per_launch ||
      existing.success_rate !== record.success_rate ||
      (existing.first_flight || "") !== (record.first_flight || "") ||
      (existing.details || "") !== (record.details || "");

    if (changed) {
      updateStmt.run(record.name, record.type, record.category, record.date_utc, record.date_day, record.active, record.stages, record.boosters, record.cost_per_launch, record.success_rate, record.first_flight, record.details, "spacex", now, record.id);
      return "updated";
    }

    return "skipped";
  }
}

module.exports = new RocketModel();
