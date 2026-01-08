const DATA_TYPES = {
  launches: {
    table: "launches",
    sortColumns: ["name", "date_utc", "date_day", "category", "success", "source", "created_at", "updated_at"],
    hasDate: true,
    syncKey: "launches_last_sync",
    apiUrl: "https://api.spacexdata.com/v4/launches",
  },
  ships: {
    table: "ships",
    sortColumns: ["name", "date_utc", "date_day", "type", "category", "active", "home_port", "year_built", "source", "created_at", "updated_at"],
    hasDate: true,
    syncKey: "ships_last_sync",
    apiUrl: "https://api.spacexdata.com/v4/ships",
  },
  rockets: {
    table: "rockets",
    sortColumns: ["name", "date_utc", "date_day", "type", "category", "active", "stages", "cost_per_launch", "success_rate", "first_flight", "source", "created_at", "updated_at"],
    hasDate: true,
    syncKey: "rockets_last_sync",
    apiUrl: "https://api.spacexdata.com/v4/rockets",
  },
  capsules: {
    table: "capsules",
    sortColumns: ["name", "date_utc", "date_day", "type", "category", "status", "reuse_count", "source", "created_at", "updated_at"],
    hasDate: true,
    syncKey: "capsules_last_sync",
    apiUrl: "https://api.spacexdata.com/v4/capsules",
  },
  history: {
    table: "history",
    sortColumns: ["name", "date_utc", "date_day", "category", "flight_number", "source", "created_at", "updated_at"],
    hasDate: true,
    syncKey: "history_last_sync",
    apiUrl: "https://api.spacexdata.com/v4/history",
  },
  launchpads: {
    table: "launchpads",
    sortColumns: ["name", "full_name", "locality", "region", "category", "status", "launch_attempts", "launch_successes", "source", "created_at", "updated_at"],
    hasDate: false,
    syncKey: "launchpads_last_sync",
    apiUrl: "https://api.spacexdata.com/v4/launchpads",
  },
};

const ALLOWED_SORT_ORDERS = ["asc", "desc"];

const SYNC_LOCK_KEY = "sync_lock";
const SYNC_LOCK_TIMEOUT_MS = 5 * 60 * 1000;

function getConfig(dataType) {
  return DATA_TYPES[dataType] || null;
}

function getAllDataTypes() {
  return Object.keys(DATA_TYPES);
}

function getDataTypeInfo() {
  return Object.keys(DATA_TYPES).map((key) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    hasDate: DATA_TYPES[key].hasDate,
  }));
}

module.exports = {
  DATA_TYPES,
  ALLOWED_SORT_ORDERS,
  SYNC_LOCK_KEY,
  SYNC_LOCK_TIMEOUT_MS,
  getConfig,
  getAllDataTypes,
  getDataTypeInfo,
};
