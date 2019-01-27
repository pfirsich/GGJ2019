const fs = require("fs");
const path = require("path");

const { users, getEntityById } = require("./data");
const world = require("./world");
const draw = require("./draw");
const util = require("./util");

const CONS_PATH = path.join(__dirname, "cons");
const SIGNAL_PATTERN = /^<==>(.+?):(.+?)\.(.*)/;
const ESC_PATTERN = /^\u001b\[(.)(.*)/;

const TOP_HUD_SIZE = 4;
const BOTTOM_HUD_SIZE = 4;

function userInputHandler(userId, data) {
  console.log("cons:input:data", JSON.stringify(data));

  let match = data.match(SIGNAL_PATTERN);
  if (match) {
    const [, type, payload, rest] = match;

    userSignalHandler(userId, type, payload);

    if (rest) {
      userInputHandler(userId, rest);
    }
    return;
  }

  match = data.match(ESC_PATTERN);
  if (match) {
    const [, char, rest] = match;
    const e = getEntityById(users[userId].entityId);

    if (char === "A") {
      world.moveEntity(e, e.x, e.y - 1);
    } else if (char === "B") {
      world.moveEntity(e, e.x, e.y + 1);
    } else if (char === "C") {
      world.moveEntity(e, e.x + 1, e.y);
    } else if (char === "D") {
      world.moveEntity(e, e.x - 1, e.y);
    }

    let teleportCollisions = world.getEntityCollision(
      e.realmName,
      e.x,
      e.y,
      "teleport"
    );

    if (teleportCollisions.length) {
      if (teleportCollisions.length > 1)
        throw new Error("Collision with multiple teleports");
      let teleporter = getEntityById(teleportCollisions[0]);
      let destRealm = teleporter.properties.destination;
      world.teleportEntity(e, destRealm);
      users[userId].needsFullDraw = true;
    }

    if (rest) {
      userInputHandler(userId, rest);
    }
    return;
  }

  if (!users[userId]) throw new Error("cons:user-not-ready");
}

function userSignalHandler(userId, type, payload) {
  if (type === "size") {
    const [rows, cols] = payload.split(",");
    users[userId].rows = parseInt(rows, 10);
    users[userId].cols = parseInt(cols, 10);

    users[userId].needsFullDraw = true;
    draw.queueDrawCheck();

    console.log(
      "cons:signal:term-size",
      users[userId].rows,
      users[userId].cols,
      rows,
      cols
    );
  }
}

function userJoined(userId) {
  let character = util.randomChoice("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  let startRealm = "city";
  let spawnPoint = world.getPlayerSpawnPoint(startRealm);
  let entity = world.createEntity(
    startRealm,
    "player",
    spawnPoint.x,
    spawnPoint.y,
    {
      character,
      color: "blue",
      solid: true
    }
  );
  users[userId].entityId = entity.id;
}

function checkForPipes() {
  fs.readdir(CONS_PATH, (err, files) => {
    files.forEach(pipeName => {
      let matchResult = pipeName.match(/user-(\d+)-(in|out)/);

      if (matchResult) {
        let [, userId, pipeType] = matchResult;

        if (!users[userId]) {
          users[userId] = { id: userId, ready: false, needsFullDraw: false };
        }

        if (pipeType == "in" && !users[userId].streamIn) {
          console.log("cons:streams:create-in");
          users[userId].streamIn = fs.createReadStream(
            path.join(CONS_PATH, pipeName)
          );
          users[userId].streamIn.on("data", data =>
            userInputHandler(userId, data.toString("utf8"))
          );
        } else if (pipeType == "out" && !users[userId].streamOut) {
          console.log("cons:streams:create-out");
          users[userId].streamOut = fs.createWriteStream(
            path.join(CONS_PATH, pipeName)
          );
        }

        if (
          !users[userId].ready &&
          users[userId].streamIn &&
          users[userId].streamOut
        ) {
          users[userId].ready = true;
          users[userId].needsFullDraw = true;
          userJoined(userId);
        }
      }
    });
  });
}

function watch() {
  console.log("cons:watching");
  setInterval(() => {
    checkForPipes();
  }, 250);
}

module.exports.watch = watch;
module.exports.users = users;
