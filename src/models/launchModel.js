const db = require("../../db");
const BaseModel = require("./baseModel");
const { parseDate, normalizeSuccess } = require("../utils/dateUtils");

class LaunchModel extends BaseModel {
  constructor() {
    super("launches");
  }

  create(data) {
    const { name, category, date, date_utc, success, details } = data;
    const dateInfo = parseDate(date_utc || date);

    if (!dateInfo) {
      throw new Error("valid date is required");
    }

    const now = new Date().toISOString();
    const id = require("crypto").randomUUID();

    db.prepare(
      `INSERT INTO launches (id, name, date_utc, date_day, category, success, details, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, name.trim(), dateInfo.date_utc, dateInfo.date_day, category.trim(), normalizeSuccess(success), details || null, "manual", now, now);

    return { id };
  }

  update(id, data) {
    const existing = this.findById(id);
    if (!existing) return null;

    const { name, category, date, date_utc, success, details } = data;
    const dateInfo = parseDate(date_utc || date);

    if (!dateInfo) {
      throw new Error("valid date is required");
    }

    const now = new Date().toISOString();

    db.prepare(
      `UPDATE launches SET name = ?, date_utc = ?, date_day = ?, category = ?, success = ?, details = ?, updated_at = ? WHERE id = ?`
    ).run(name.trim(), dateInfo.date_utc, dateInfo.date_day, category.trim(), normalizeSuccess(success), details || null, now, id);

    return { id };
  }

  upsertFromApi(record, now) {
    const selectStmt = db.prepare("SELECT name, date_utc, category, success, details FROM launches WHERE id = ?");
    const insertStmt = db.prepare(
      `INSERT INTO launches (id, name, date_utc, date_day, category, success, details, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const updateStmt = db.prepare(
      `UPDATE launches SET name = ?, date_utc = ?, date_day = ?, category = ?, success = ?, details = ?, source = ?, updated_at = ? WHERE id = ?`
    );

    const existing = selectStmt.get(record.id);

    if (!existing) {
      insertStmt.run(record.id, record.name, record.date_utc, record.date_day, record.category, record.success, record.details, "spacex", now, now);
      return "inserted";
    }

    const changed = existing.name !== record.name ||
      existing.date_utc !== record.date_utc ||
      existing.category !== record.category ||
      existing.success !== record.success ||
      (existing.details || "") !== (record.details || "");

    if (changed) {
      updateStmt.run(record.name, record.date_utc, record.date_day, record.category, record.success, record.details, "spacex", now, record.id);
      return "updated";
    }

    return "skipped";
  }
}

module.exports = new LaunchModel();
