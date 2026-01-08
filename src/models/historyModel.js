const db = require("../../db");
const BaseModel = require("./baseModel");
const { parseDate } = require("../utils/dateUtils");

class HistoryModel extends BaseModel {
  constructor() {
    super("history");
  }

  create(data) {
    const { name, category, date, date_utc, flight_number, details } = data;
    const dateInfo = parseDate(date_utc || date);

    if (!dateInfo) {
      throw new Error("valid date is required");
    }

    const now = new Date().toISOString();
    const id = require("crypto").randomUUID();

    db.prepare(
      `INSERT INTO history (id, name, date_utc, date_day, category, flight_number, details, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, name.trim(), dateInfo.date_utc, dateInfo.date_day, category.trim(), flight_number || null, details || null, "manual", now, now);

    return { id };
  }

  update(id, data) {
    const existing = this.findById(id);
    if (!existing) return null;

    const { name, category, date, date_utc, flight_number, details } = data;
    const dateInfo = parseDate(date_utc || date);

    if (!dateInfo) {
      throw new Error("valid date is required");
    }

    const now = new Date().toISOString();

    db.prepare(
      `UPDATE history SET name = ?, date_utc = ?, date_day = ?, category = ?, flight_number = ?, details = ?, updated_at = ? WHERE id = ?`
    ).run(name.trim(), dateInfo.date_utc, dateInfo.date_day, category.trim(), flight_number || null, details || null, now, id);

    return { id };
  }

  upsertFromApi(record, now) {
    const selectStmt = db.prepare("SELECT name, date_utc, category, flight_number FROM history WHERE id = ?");
    const insertStmt = db.prepare(
      `INSERT INTO history (id, name, date_utc, date_day, category, flight_number, details, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const updateStmt = db.prepare(
      `UPDATE history SET name = ?, date_utc = ?, date_day = ?, category = ?, flight_number = ?, details = ?, source = ?, updated_at = ? WHERE id = ?`
    );

    const existing = selectStmt.get(record.id);

    if (!existing) {
      insertStmt.run(record.id, record.name, record.date_utc, record.date_day, record.category, record.flight_number, record.details, "spacex", now, now);
      return "inserted";
    }

    const changed =
      existing.name !== record.name ||
      existing.date_utc !== record.date_utc ||
      existing.flight_number !== record.flight_number;

    if (changed) {
      updateStmt.run(record.name, record.date_utc, record.date_day, record.category, record.flight_number, record.details, "spacex", now, record.id);
      return "updated";
    }

    return "skipped";
  }
}

module.exports = new HistoryModel();
