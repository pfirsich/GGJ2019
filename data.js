const world = {}; // world[realmName] = array of entities
const entityIdMap = {}; // entityIdMap[entityId] = entity
const entityMap = {}; // entityMap[realmName][y][x] = array of entity ids
const users = {}; // entityMap[realmName][y][x] = array of entity ids

function getEntityById(id) {
  return entityIdMap[id];
}

function getRealmSize(realmName) {
  if (!realmName) {
    throw new Error("No realmName");
  }
  return {
    x: world[realmName].cols,
    y: world[realmName].rows
  };
}

module.exports = {
  world,
  entityIdMap,
  entityMap,
  users,

  getEntityById,
  getRealmSize
};
