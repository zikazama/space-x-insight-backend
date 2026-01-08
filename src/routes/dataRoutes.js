const express = require("express");
const { dataController } = require("../controllers");
const { validateDataType } = require("../middleware/validateDataType");

const router = express.Router();

/**
 * @swagger
 * /api/{dataType}:
 *   get:
 *     summary: Get all data with pagination
 *     tags: [Data]
 *     parameters:
 *       - $ref: '#/components/parameters/dataType'
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Number of items per page
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           default: updated_at
 *         description: Column to sort by
 *       - name: order
 *         in: query
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - name: source
 *         in: query
 *         schema:
 *           type: string
 *           enum: [manual, spacex]
 *         description: Filter by source
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search in name and details
 *     responses:
 *       200:
 *         description: Paginated list of data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid data type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:dataType", validateDataType, dataController.getAll);

/**
 * @swagger
 * /api/{dataType}/{id}:
 *   get:
 *     summary: Get a single record by ID
 *     tags: [Data]
 *     parameters:
 *       - $ref: '#/components/parameters/dataType'
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: The requested record
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Launch'
 *                 - $ref: '#/components/schemas/Ship'
 *                 - $ref: '#/components/schemas/Rocket'
 *                 - $ref: '#/components/schemas/Capsule'
 *                 - $ref: '#/components/schemas/History'
 *       400:
 *         description: Invalid data type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:dataType/:id", validateDataType, dataController.getById);

/**
 * @swagger
 * /api/{dataType}:
 *   post:
 *     summary: Create a new record
 *     tags: [Data]
 *     parameters:
 *       - $ref: '#/components/parameters/dataType'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateData'
 *           examples:
 *             launch:
 *               summary: Create a launch
 *               value:
 *                 name: "Test Launch"
 *                 category: "Falcon 9"
 *                 date: "2024-01-15"
 *                 success: true
 *                 details: "Test launch details"
 *             ship:
 *               summary: Create a ship
 *               value:
 *                 name: "Test Ship"
 *                 type: "Cargo"
 *                 category: "Recovery"
 *                 active: true
 *                 home_port: "Port Canaveral"
 *     responses:
 *       201:
 *         description: Record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *       400:
 *         description: Invalid data type or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:dataType", validateDataType, dataController.create);

/**
 * @swagger
 * /api/{dataType}/{id}:
 *   put:
 *     summary: Update an existing record
 *     tags: [Data]
 *     parameters:
 *       - $ref: '#/components/parameters/dataType'
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateData'
 *     responses:
 *       200:
 *         description: Record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *       400:
 *         description: Invalid data type or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:dataType/:id", validateDataType, dataController.update);

/**
 * @swagger
 * /api/{dataType}/{id}:
 *   delete:
 *     summary: Delete a record
 *     tags: [Data]
 *     parameters:
 *       - $ref: '#/components/parameters/dataType'
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid data type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:dataType/:id", validateDataType, dataController.remove);

module.exports = router;
