const { getModel } = require("../models");
const { getConfig } = require("../config/dataTypes");

function getAll(dataType, options) {
  const model = getModel(dataType);
  if (!model) {
    throw new Error("Invalid data type");
  }
  return model.findAll(options);
}

function getById(dataType, id) {
  const model = getModel(dataType);
  if (!model) {
    throw new Error("Invalid data type");
  }
  return model.findById(id);
}

function create(dataType, data) {
  const model = getModel(dataType);
  if (!model) {
    throw new Error("Invalid data type");
  }

  if (!data.name || !data.category) {
    throw new Error("name and category are required");
  }

  return model.create(data);
}

function update(dataType, id, data) {
  const model = getModel(dataType);
  if (!model) {
    throw new Error("Invalid data type");
  }

  if (!data.name || !data.category) {
    throw new Error("name and category are required");
  }

  const result = model.update(id, data);
  if (!result) {
    throw new Error("not found");
  }

  return result;
}

function remove(dataType, id) {
  const model = getModel(dataType);
  if (!model) {
    throw new Error("Invalid data type");
  }

  const deleted = model.deleteById(id);
  if (!deleted) {
    throw new Error("not found");
  }

  return { ok: true };
}

function isValidDataType(dataType) {
  return getConfig(dataType) !== null;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  isValidDataType,
};
