const analyticsService = require("../services/analyticsService");

function getAnalytics(req, res) {
  try {
    const { dataType } = req.params;
    const { start, end } = req.query;

    const result = analyticsService.getAnalytics(dataType, { start, end });
    res.json(result);
  } catch (error) {
    if (error.message === "Invalid data type") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getAnalytics,
};
