const launchModel = require("./launchModel");
const shipModel = require("./shipModel");
const rocketModel = require("./rocketModel");
const capsuleModel = require("./capsuleModel");
const historyModel = require("./historyModel");
const launchpadModel = require("./launchpadModel");
const syncModel = require("./syncModel");
const BaseModel = require("./baseModel");

const models = {
  launches: launchModel,
  ships: shipModel,
  rockets: rocketModel,
  capsules: capsuleModel,
  history: historyModel,
  launchpads: launchpadModel,
};

function getModel(dataType) {
  return models[dataType] || null;
}

module.exports = {
  launchModel,
  shipModel,
  rocketModel,
  capsuleModel,
  historyModel,
  launchpadModel,
  syncModel,
  BaseModel,
  getModel,
};
