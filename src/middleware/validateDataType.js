const { getConfig } = require("../config/dataTypes");

function validateDataType(req, res, next) {
  const { dataType } = req.params;

  if (!dataType) {
    return next();
  }

  const config = getConfig(dataType);
  if (!config) {
    return res.status(400).json({ error: "Invalid data type" });
  }

  next();
}

module.exports = {
  validateDataType,
};
