const fs = require("fs");
const path = require("path");

const { world, entityMap, entityIdMap, getEntityById } = require("./data");

const draw = require("./draw");
const util = require("./util");

let createEntity;
{
  let entityIdCounter = 0;
  createEntity = function(realmName, type, x, y, properties) {
    let id = entityIdCounter++;

    if (!properties) {
      throw new Error("No properties");
    }

    let entity = { realmName, id, type, x, y, properties };

    world[realmName].entities.push(entity);
    entityIdMap[id] = entity;

    if (type === "playerSpawn") {
      world[realmName].spawnPoints.push({ x, y });
    }

    pushIntoEntityMap(realmName, x, y, id);
    updateMapTile(realmName, x, y);

    return entity;
  };
}

function getPlayerSpawnPoint(realmName) {
  return util.randomChoice(world[realmName].spawnPoints);
}

function getEntityByLocation(realmName, x, y, range = 0) {
  let entities = [];
  for (let cy = y - range; cy < y + range + 1; cy++) {
    for (let cx = x - range; cx < x + range + 1; cx++) {
      if (
        entityMap[realmName] &&
        entityMap[realmName][cy] &&
        entityMap[realmName][cy][cx]
      ) {
        entities.push(...entityMap[realmName][cy][cx]);
      }
    }
  }
  return entities;
}

function pushIntoEntityMap(realmName, x, y, id) {
  if (!entityMap[realmName]) entityMap[realmName] = {};
  if (!entityMap[realmName][y]) entityMap[realmName][y] = {};
  if (!entityMap[realmName][y][x]) entityMap[realmName][y][x] = [];
  entityMap[realmName][y][x].push(id);
}

function moveEntity(entity, newX, newY) {
  const oldX = entity.x;
  const oldY = entity.y;

  const realmName = entity.realmName;

  entity.x = newX;
  entity.y = newY;

  entityMap[realmName][oldY][oldX] = entityMap[realmName][oldY][oldX].filter(
    id => id != entity.id
  );
  pushIntoEntityMap(realmName, newX, newY, entity.id);

  updateMapTile(realmName, oldX, oldY);
  updateMapTile(realmName, newX, newY);
}

function updateMapTile(realmName, x, y) {
  const entities = getEntityByLocation(realmName, x, y);

  let character;
  let color;
  let bgColor;

  for (let entityId of entities.reverse()) {
    const entity = getEntityById(entityId);

    if (!character && entity.properties.character) {
      character = entity.properties.character;
      color = entity.properties.color;
    }
    if (!bgColor && entity.properties.bgColor) {
      bgColor = entity.properties.bgColor;
    }
    if (character && bgColor) {
      break;
    }
  }

  if (!bgColor) {
    bgColor = world[realmName].metaData.bgColor;
  }

  draw.setMap(realmName, x, y, bgColor, color, character);
}

function addTile(realmName, x, y, char, tileDefinitionMap, tileDefinition) {
  if (!tileDefinition) {
    tileDefinition = tileDefinitionMap[char];
  }

  if (!tileDefinition)
    throw new Error(`Unknown character for realm ${realmName}: '${char}'`);
  if (Array.isArray(tileDefinition)) {
    tileDefinition.forEach(tile => {
      addTile(realmName, x, y, char, tileDefinitionMap, tile);
    });
  } else if (typeof tileDefinition == "string") {
    addTile(realmName, x, y, tileDefinition, tileDefinitionMap);
  } else {
    const type = tileDefinition.type;
    const properties = util.ghettoCopy(tileDefinition);
    delete properties.type;
    if (!("character" in properties)) {
      properties.character = char;
    }
    createEntity(realmName, type, x, y, properties);
    updateMapTile(realmName, x, y);
  }
}

function init() {
  let realmsRoot = path.join(__dirname, "realms");
  let realmFiles = fs.readdirSync(realmsRoot);

  realmFiles.forEach(realmName => {
    let fileData = fs.readFileSync(path.join(realmsRoot, realmName), "ascii");
    let lines = fileData.split("\n");

    const metaDataStart = lines.findIndex(line => !line);
    const tileDefinitionMapStart =
      lines.slice(metaDataStart + 1).findIndex(line => !line) +
      metaDataStart +
      1;

    const metaData = JSON.parse(
      lines.slice(metaDataStart, tileDefinitionMapStart).join("\n")
    );
    const tileDefinitionMap = JSON.parse(
      lines.slice(tileDefinitionMapStart).join("\n")
    );

    world[realmName] = {
      entities: [],
      spawnPoints: [],
      metaData,
      rows: 0,
      cols: 0
    };

    lines.slice(0, metaDataStart).forEach((line, row) => {
      world[realmName].rows = Math.max(world[realmName].rows, row + 1);
      [...line].forEach((char, col) => {
        world[realmName].cols = Math.max(world[realmName].cols, col + 1);
        addTile(realmName, col, row, char, tileDefinitionMap);
      });
    });
  });
}

function updateMap() {}

module.exports.init = init;
module.exports.createEntity = createEntity;
module.exports.getEntityByLocation = getEntityByLocation;
module.exports.getPlayerSpawnPoint = getPlayerSpawnPoint;
module.exports.moveEntity = moveEntity;
