const db = require("../../db");
const { getConfig, ALLOWED_SORT_ORDERS } = require("../config/dataTypes");

class BaseModel {
  constructor(dataType) {
    this.dataType = dataType;
    this.config = getConfig(dataType);
    if (!this.config) {
      throw new Error(`Invalid data type: ${dataType}`);
    }
    this.table = this.config.table;
  }

  findById(id) {
    return db.prepare(`SELECT * FROM ${this.table} WHERE id = ?`).get(id);
  }

  findAll(options = {}) {
    const {
      page = 1,
      limit = 50,
      sort = "updated_at",
      order = "desc",
      category = "",
      source = "",
      search = "",
    } = options;

    const actualPage = Math.max(1, parseInt(page, 10) || 1);
    const actualLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (actualPage - 1) * actualLimit;

    let sortCol = this.config.sortColumns.includes(sort) ? sort : "updated_at";
    let sortOrder = ALLOWED_SORT_ORDERS.includes(order.toLowerCase()) ? order : "desc";

    const whereConditions = [];
    const params = [];

    if (category) {
      whereConditions.push("category LIKE ?");
      params.push(`%${category}%`);
    }
    if (source) {
      whereConditions.push("source LIKE ?");
      params.push(`%${source}%`);
    }
    if (search) {
      whereConditions.push("(name LIKE ? OR details LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const countRow = db
      .prepare(`SELECT COUNT(*) as total FROM ${this.table} ${whereClause}`)
      .get(...params);
    const total = countRow ? countRow.total : 0;

    const rows = db
      .prepare(
        `SELECT * FROM ${this.table}
         ${whereClause}
         ORDER BY ${sortCol} ${sortOrder.toUpperCase()}
         LIMIT ? OFFSET ?`
      )
      .all(...params, actualLimit, offset);

    return {
      data: rows,
      pagination: {
        page: actualPage,
        limit: actualLimit,
        total,
        totalPages: Math.ceil(total / actualLimit),
        hasNext: actualPage * actualLimit < total,
        hasPrev: actualPage > 1,
      },
      sort: { column: sortCol, order: sortOrder },
    };
  }

  count() {
    const row = db.prepare(`SELECT COUNT(*) as total FROM ${this.table}`).get();
    return row ? row.total : 0;
  }

  countInRange(startDay, endDay) {
    if (!this.config.hasDate) return this.count();

    const row = db
      .prepare(`SELECT COUNT(*) as total FROM ${this.table} WHERE date_day >= ? AND date_day <= ?`)
      .get(startDay, endDay);
    return row ? row.total : 0;
  }

  getTopCategory(startDay, endDay) {
    if (this.config.hasDate) {
      return db
        .prepare(
          `SELECT category, COUNT(*) as count
           FROM ${this.table}
           WHERE date_day >= ? AND date_day <= ?
           GROUP BY category
           ORDER BY count DESC
           LIMIT 1`
        )
        .get(startDay, endDay);
    }

    return db
      .prepare(
        `SELECT category, COUNT(*) as count
         FROM ${this.table}
         GROUP BY category
         ORDER BY count DESC
         LIMIT 1`
      )
      .get();
  }

  getLatest() {
    return db.prepare(`SELECT * FROM ${this.table} ORDER BY updated_at DESC LIMIT 1`).get();
  }

  getCategoryDistribution(startDay, endDay) {
    if (this.config.hasDate) {
      return db
        .prepare(
          `SELECT category as label, COUNT(*) as value
           FROM ${this.table}
           WHERE date_day >= ? AND date_day <= ?
           GROUP BY category
           ORDER BY value DESC`
        )
        .all(startDay, endDay);
    }

    return db
      .prepare(
        `SELECT category as label, COUNT(*) as value
         FROM ${this.table}
         GROUP BY category
         ORDER BY value DESC`
      )
      .all();
  }

  deleteById(id) {
    const result = db.prepare(`DELETE FROM ${this.table} WHERE id = ?`).run(id);
    return result.changes > 0;
  }
}

module.exports = BaseModel;
