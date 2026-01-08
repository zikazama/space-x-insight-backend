const express = require("express");
const dataRoutes = require("./dataRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const syncRoutes = require("./syncRoutes");
const { getDataTypeInfo } = require("../config/dataTypes");

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
router.get("/health", (req, res) => {
  res.json({ ok: true });
});

/**
 * @swagger
 * /api/data-types:
 *   get:
 *     summary: Get list of available data types
 *     tags: [Data Types]
 *     responses:
 *       200:
 *         description: List of available data types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DataType'
 *             example:
 *               - id: "launches"
 *                 name: "Launches"
 *                 hasDate: true
 *               - id: "ships"
 *                 name: "Ships"
 *                 hasDate: true
 *               - id: "rockets"
 *                 name: "Rockets"
 *                 hasDate: true
 *               - id: "capsules"
 *                 name: "Capsules"
 *                 hasDate: true
 *               - id: "history"
 *                 name: "History"
 *                 hasDate: true
 */
router.get("/data-types", (req, res) => {
  res.json(getDataTypeInfo());
});

// Analytics routes must come before data routes to avoid /:dataType/:id matching "analytics"
router.use("/", analyticsRoutes);

// Sync routes
router.use("/", syncRoutes);

// Data CRUD routes
router.use("/", dataRoutes);

module.exports = router;
