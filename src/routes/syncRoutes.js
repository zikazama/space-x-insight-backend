const express = require("express");
const { syncController } = require("../controllers");
const { validateDataType } = require("../middleware/validateDataType");

const router = express.Router();

/**
 * @swagger
 * /api/{dataType}/sync:
 *   post:
 *     summary: Sync data from SpaceX API
 *     description: |
 *       Fetches the latest data from the SpaceX public API and updates the local database.
 *       - New records are inserted
 *       - Existing records are updated if changed
 *       - Unchanged records are skipped
 *
 *       Only one sync operation can run at a time. If a sync is already in progress,
 *       the request will return a 409 Conflict error.
 *     tags: [Sync]
 *     parameters:
 *       - $ref: '#/components/parameters/dataType'
 *     responses:
 *       200:
 *         description: Sync completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncResult'
 *             example:
 *               dataType: "launches"
 *               inserted: 5
 *               updated: 3
 *               skipped: 197
 *               lastSync: "2024-01-15T10:30:00.000Z"
 *               totalFetched: 205
 *               durationMs: 2345
 *       400:
 *         description: Invalid data type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Sync already in progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Sync already in progress"
 *       500:
 *         description: Sync failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:dataType/sync", validateDataType, syncController.syncDataType);

/**
 * @swagger
 * /api/sync/status:
 *   get:
 *     summary: Get sync status for all data types
 *     description: Returns whether a sync is currently in progress and the last sync time for each data type.
 *     tags: [Sync]
 *     responses:
 *       200:
 *         description: Sync status information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncStatus'
 *             example:
 *               isLocked: false
 *               lastSync:
 *                 launches: "2024-01-15T10:30:00.000Z"
 *                 ships: "2024-01-15T10:35:00.000Z"
 *                 rockets: "2024-01-15T10:40:00.000Z"
 *                 capsules: null
 *                 history: null
 */
router.get("/sync/status", syncController.getSyncStatus);

module.exports = router;
