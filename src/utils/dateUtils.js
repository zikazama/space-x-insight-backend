function parseDate(input) {
  if (!input) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return { date_day: input, date_utc: `${input}T00:00:00.000Z` };
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;

  const iso = parsed.toISOString();
  return { date_day: iso.slice(0, 10), date_utc: iso };
}

function yearToDate(yearValue) {
  if (yearValue === null || yearValue === undefined || yearValue === "") return null;

  const yearString = String(yearValue).trim();
  if (!/^\d{4}$/.test(yearString)) return null;

  return `${yearString}-01-01`;
}

function resolveDateInfo(primaryValue, existingInfo) {
  const parsed = parseDate(primaryValue);
  if (parsed) return parsed;

  if (existingInfo?.date_utc && existingInfo?.date_day) {
    return { date_utc: existingInfo.date_utc, date_day: existingInfo.date_day };
  }

  return parseDate(new Date().toISOString());
}

function defaultRange() {
  const end = new Date();
  const start = new Date("2000-01-01");
  return {
    startDay: start.toISOString().slice(0, 10),
    endDay: end.toISOString().slice(0, 10),
  };
}

function calculateBucketType(startDay, endDay) {
  const start = new Date(startDay);
  const end = new Date(endDay);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  if (diffDays <= 31) return "daily";
  if (diffDays <= 90) return "weekly";
  return "monthly";
}

function normalizeSuccess(value) {
  if (value === null || value === undefined || value === "") return null;
  if (value === true || value === 1 || value === "1" || value === "true") return 1;
  if (value === false || value === 0 || value === "0" || value === "false") return 0;
  return null;
}

module.exports = {
  parseDate,
  yearToDate,
  resolveDateInfo,
  defaultRange,
  calculateBucketType,
  normalizeSuccess,
};
