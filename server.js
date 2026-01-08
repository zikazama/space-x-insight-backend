const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");
const routes = require("./src/routes");
const { log } = require("./src/utils/logger");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "SpaceX Data Insights API Documentation",
}));

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// API routes
app.use("/api", routes);

// Start server
app.listen(PORT, () => {
  log("INFO", "Server started", { port: PORT });
  log("INFO", "API Documentation available at", { url: `http://localhost:${PORT}/api-docs` });
});
