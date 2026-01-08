const dataService = require("../services/dataService");

function getAll(req, res) {
  try {
    const { dataType } = req.params;
    const result = dataService.getAll(dataType, req.query);
    res.json(result);
  } catch (error) {
    if (error.message === "Invalid data type") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

function getById(req, res) {
  try {
    const { dataType, id } = req.params;
    const result = dataService.getById(dataType, id);

    if (!result) {
      return res.status(404).json({ error: "not found" });
    }

    res.json(result);
  } catch (error) {
    if (error.message === "Invalid data type") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

function create(req, res) {
  try {
    const { dataType } = req.params;
    const result = dataService.create(dataType, req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.message === "Invalid data type") {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "name and category are required") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

function update(req, res) {
  try {
    const { dataType, id } = req.params;
    const result = dataService.update(dataType, id, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === "Invalid data type") {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "name and category are required") {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

function remove(req, res) {
  try {
    const { dataType, id } = req.params;
    const result = dataService.remove(dataType, id);
    res.json(result);
  } catch (error) {
    if (error.message === "Invalid data type") {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
