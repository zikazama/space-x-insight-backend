const db = require("../../db");
const BaseModel = require("./baseModel");
const { resolveDateInfo, yearToDate, normalizeSuccess } = require("../utils/dateUtils");

class ShipModel extends BaseModel {
  constructor() {
    super("ships");
  }

  create(data) {
    const { name, category, type, date, date_utc, active, home_port, year_built, details } = data;
    const dateInfo = resolveDateInfo(date_utc || date || yearToDate(year_built));

    const now = new Date().toISOString();
    const id = require("crypto").randomUUID();

    db.prepare(
      `INSERT INTO ships (id, name, type, category, date_utc, date_day, active, home_port, year_built, details, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, name.trim(), type || "Unknown", category.trim(), dateInfo.date_utc, dateInfo.date_day, normalizeSuccess(active), home_port || null, year_built || null, details || null, "manual", now, now);

    return { id };
  }

  update(id, data) {
    const existing = db.prepare(`SELECT id, date_utc, date_day FROM ships WHERE id = ?`).get(id);
    if (!existing) return null;

    const { name, category, type, date, date_utc, active, home_port, year_built, details } = data;
    const dateInfo = resolveDateInfo(date_utc || date || yearToDate(year_built), existing);

    const now = new Date().toISOString();

    db.prepare(
      `UPDATE ships SET name = ?, type = ?, category = ?, date_utc = ?, date_day = ?, active = ?, home_port = ?, year_built = ?, details = ?, updated_at = ? WHERE id = ?`
    ).run(name.trim(), type || "Unknown", category.trim(), dateInfo.date_utc, dateInfo.date_day, normalizeSuccess(active), home_port || null, year_built || null, details || null, now, id);

    return { id };
  }

  upsertFromApi(record, now) {
    const selectStmt = db.prepare("SELECT name, type, category, date_utc, date_day, active, home_port, year_built, details FROM ships WHERE id = ?");
    const insertStmt = db.prepare(
      `INSERT INTO ships (id, name, type, category, date_utc, date_day, active, home_port, year_built, details, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const updateStmt = db.prepare(
      `UPDATE ships SET name = ?, type = ?, category = ?, date_utc = ?, date_day = ?, active = ?, home_port = ?, year_built = ?, details = ?, source = ?, updated_at = ? WHERE id = ?`
    );

    const existing = selectStmt.get(record.id);

    if (!existing) {
      insertStmt.run(record.id, record.name, record.type, record.category, record.date_utc, record.date_day, record.active, record.home_port, record.year_built, record.details, "spacex", now, now);
      return "inserted";
    }

    const changed =
      existing.name !== record.name ||
      existing.type !== record.type ||
      existing.category !== record.category ||
      existing.date_utc !== record.date_utc ||
      existing.date_day !== record.date_day ||
      existing.active !== record.active ||
      (existing.home_port || "") !== (record.home_port || "") ||
      (existing.year_built || null) !== record.year_built ||
      (existing.details || "") !== (record.details || "");

    if (changed) {
      updateStmt.run(record.name, record.type, record.category, record.date_utc, record.date_day, record.active, record.home_port, record.year_built, record.details, "spacex", now, record.id);
      return "updated";
    }

    return "skipped";
  }
}

module.exports = new ShipModel();
