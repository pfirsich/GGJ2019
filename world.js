const fs = require("fs");
const path = require("path");

const draw = require("./draw");
const util = require("./util");

let world = {}; // world[realmId] = array of entities
let entityIdMap = {}; // entityIdMap[entityId] = entity
let entityMap = {}; // entityMap[y][x] = array of entity ids

function ghettoCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const defaultEntities = {
  "#": {
    type: "wall"
  },
  S: {
    type: "spawn",
    character: null
  }
};

let createEntity;
{
  let entityIdCounter = 0;
  createEntity = function(realm, type, character, color, x, y) {
    let id = entityIdCounter++;
    let entity = {
      realm,
      id,
      type,
      character,
      color,
      x,
      y
    };
    world[realm].entities.push(entity);
    entityIdMap[id] = entity;
    return entity;
  };
}

function getEntityById(id) {
  return entityIdMap[id];
}

function getPlayerSpawnPoint(realmId) {
  return randomChoice(world[realmId].spawnPoints);
}

function getEntityByLocation(x, y, range = 1) {
  let entities = [];
  for (let cy = y - range; cy < y + range; cy++) {
    for (let cx = x - range; cx < x + range; cx++) {
      entities.push(...entityMap[cy][cx]);
    }
  }
  return entities;
}

function init() {
  let realmsRoot = path.join(__dirname, "realms");
  let realmFiles = fs.readdirSync(realmsRoot);
  realmFiles.forEach(realmName => {
    let fileData = fs.readFileSync(path.join(realmsRoot, realmName), "ascii");
    let lines = fileData.split("\n");

    const metaDataStart = lines.findIndex(line => !line);
    const tileDataStart = lines.findIndex(line => !line, metaDataStart + 1);
    const metaData = JSON.parse(
      metaData.slice(metaDataStart, tileDataStart).join("\n")
    );
    const tileData = JSON.parse(metaData.slice(tileDataStart).join("\n"));

    world[realmName] = {
      entities: [],
      spawnPoints: []
    };
    lines.slice(0, firstEmptyLineIndex).forEach((line, row) => {
      line.forEach((char, col) => {
        if (!values[char])
          throw new Error("Unknown character for realm " + realmName);
        createEntity(values[char]);
        draw.setMap(realmName, col, row);
      });
    });
  });
}

function updateMap() {}

module.exports = { init };
