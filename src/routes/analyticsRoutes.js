const express = require("express");
const { analyticsController } = require("../controllers");
const { validateDataType } = require("../middleware/validateDataType");

const router = express.Router();

/**
 * @swagger
 * /api/{dataType}/analytics:
 *   get:
 *     summary: Get analytics and statistics for a data type
 *     tags: [Analytics]
 *     parameters:
 *       - $ref: '#/components/parameters/dataType'
 *       - name: start
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *           example: "2020-01-01"
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - name: end
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         description: End date for filtering (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Analytics data including summary and chart data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Analytics'
 *             example:
 *               dataType: "launches"
 *               range:
 *                 start: "2020-01-01"
 *                 end: "2024-12-31"
 *               summary:
 *                 total: 205
 *                 inRange: 180
 *                 topCategory:
 *                   category: "Falcon 9"
 *                   count: 150
 *                 latest:
 *                   id: "abc123"
 *                   name: "Starlink 6-32"
 *                 lastSync: "2024-01-15T10:30:00.000Z"
 *               charts:
 *                 byCategory:
 *                   - label: "Falcon 9"
 *                     value: 150
 *                   - label: "Falcon Heavy"
 *                     value: 10
 *                 byDate:
 *                   - date: "2024-01"
 *                     count: 8
 *                   - date: "2024-02"
 *                     count: 6
 *                 bucketType: "monthly"
 *       400:
 *         description: Invalid data type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:dataType/analytics", validateDataType, analyticsController.getAnalytics);

module.exports = router;
