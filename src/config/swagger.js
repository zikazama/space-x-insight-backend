const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SpaceX Data Insights API",
      version: "1.0.0",
      description: "API untuk mengelola data SpaceX (launches, ships, rockets, capsules, history)",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Health check endpoints",
      },
      {
        name: "Data Types",
        description: "Data type information",
      },
      {
        name: "Data",
        description: "CRUD operations for all data types",
      },
      {
        name: "Analytics",
        description: "Analytics and statistics",
      },
      {
        name: "Sync",
        description: "Data synchronization with SpaceX API",
      },
    ],
    components: {
      schemas: {
        Launch: {
          type: "object",
          properties: {
            id: { type: "string", example: "5eb87cd9ffd86e000604b32a" },
            name: { type: "string", example: "FalconSat" },
            date_utc: { type: "string", format: "date-time" },
            date_day: { type: "string", format: "date", example: "2006-03-24" },
            category: { type: "string", example: "Falcon 1" },
            success: { type: "integer", enum: [0, 1, null], example: 0 },
            details: { type: "string", nullable: true },
            source: { type: "string", enum: ["manual", "spacex"] },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Ship: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "GO Ms Tree" },
            type: { type: "string", example: "Cargo" },
            category: { type: "string", example: "Fairing Recovery" },
            date_utc: { type: "string", format: "date-time" },
            date_day: { type: "string", format: "date" },
            active: { type: "integer", enum: [0, 1] },
            home_port: { type: "string", example: "Port Canaveral" },
            year_built: { type: "integer", example: 2015 },
            details: { type: "string", nullable: true },
            source: { type: "string", enum: ["manual", "spacex"] },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Rocket: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "Falcon 9" },
            type: { type: "string", example: "rocket" },
            category: { type: "string", example: "Falcon 9" },
            date_utc: { type: "string", format: "date-time" },
            date_day: { type: "string", format: "date" },
            active: { type: "integer", enum: [0, 1] },
            stages: { type: "integer", example: 2 },
            boosters: { type: "integer", example: 0 },
            cost_per_launch: { type: "integer", example: 50000000 },
            success_rate: { type: "number", example: 98 },
            first_flight: { type: "string", format: "date" },
            details: { type: "string", nullable: true },
            source: { type: "string", enum: ["manual", "spacex"] },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Capsule: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "C101" },
            type: { type: "string", example: "Dragon 1.0" },
            category: { type: "string", example: "Dragon 1.0" },
            date_utc: { type: "string", format: "date-time" },
            date_day: { type: "string", format: "date" },
            status: { type: "string", example: "retired" },
            reuse_count: { type: "integer", example: 1 },
            water_landings: { type: "integer", example: 1 },
            land_landings: { type: "integer", example: 0 },
            last_update: { type: "string", nullable: true },
            details: { type: "string", nullable: true },
            source: { type: "string", enum: ["manual", "spacex"] },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        History: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "Falcon 1 Makes History" },
            date_utc: { type: "string", format: "date-time" },
            date_day: { type: "string", format: "date" },
            category: { type: "string", example: "Historical Event" },
            flight_number: { type: "integer", nullable: true },
            details: { type: "string", nullable: true },
            source: { type: "string", enum: ["manual", "spacex"] },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        DataType: {
          type: "object",
          properties: {
            id: { type: "string", example: "launches" },
            name: { type: "string", example: "Launches" },
            hasDate: { type: "boolean", example: true },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { type: "object" },
            },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 50 },
                total: { type: "integer", example: 205 },
                totalPages: { type: "integer", example: 5 },
                hasNext: { type: "boolean", example: true },
                hasPrev: { type: "boolean", example: false },
              },
            },
            sort: {
              type: "object",
              properties: {
                column: { type: "string", example: "updated_at" },
                order: { type: "string", enum: ["asc", "desc"] },
              },
            },
          },
        },
        Analytics: {
          type: "object",
          properties: {
            dataType: { type: "string", example: "launches" },
            range: {
              type: "object",
              properties: {
                start: { type: "string", format: "date" },
                end: { type: "string", format: "date" },
              },
            },
            summary: {
              type: "object",
              properties: {
                total: { type: "integer", example: 205 },
                inRange: { type: "integer", example: 180 },
                topCategory: {
                  type: "object",
                  nullable: true,
                  properties: {
                    category: { type: "string" },
                    count: { type: "integer" },
                  },
                },
                latest: { type: "object", nullable: true },
                lastSync: { type: "string", format: "date-time", nullable: true },
              },
            },
            charts: {
              type: "object",
              properties: {
                byCategory: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      value: { type: "integer" },
                    },
                  },
                },
                byDate: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string" },
                      count: { type: "integer" },
                    },
                  },
                },
                bucketType: { type: "string", enum: ["daily", "weekly", "monthly"] },
              },
            },
          },
        },
        SyncResult: {
          type: "object",
          properties: {
            dataType: { type: "string", example: "launches" },
            inserted: { type: "integer", example: 10 },
            updated: { type: "integer", example: 5 },
            skipped: { type: "integer", example: 190 },
            lastSync: { type: "string", format: "date-time" },
            totalFetched: { type: "integer", example: 205 },
            durationMs: { type: "integer", example: 1234 },
          },
        },
        SyncStatus: {
          type: "object",
          properties: {
            isLocked: { type: "boolean", example: false },
            lastSync: {
              type: "object",
              additionalProperties: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              example: {
                launches: "2024-01-15T10:30:00.000Z",
                ships: "2024-01-15T10:35:00.000Z",
                rockets: null,
                capsules: null,
                history: null,
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Invalid data type" },
          },
        },
        CreateData: {
          type: "object",
          required: ["name", "category"],
          properties: {
            name: { type: "string", example: "Test Launch" },
            category: { type: "string", example: "Falcon 9" },
            date: { type: "string", format: "date", example: "2024-01-15" },
            success: { type: "boolean", example: true },
            details: { type: "string", example: "Test launch details" },
          },
        },
      },
      parameters: {
        dataType: {
          name: "dataType",
          in: "path",
          required: true,
          schema: {
            type: "string",
            enum: ["launches", "ships", "rockets", "capsules", "history"],
          },
          description: "Type of data to operate on",
        },
        id: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Unique identifier of the record",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
