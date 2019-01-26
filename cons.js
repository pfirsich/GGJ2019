const fs = require("fs");
const path = require("path");

const util = require("./util");
const world = require("./world");

const CONS_PATH = path.join(__dirname, "cons");
const SIGNAL_PATTERN = /^<==>(.+?):(.+?)\.(.*)/;

const users = {};

function userInputHandler(userId, data) {
  const match = data.match(SIGNAL_PATTERN);
  if (match) {
    const [, type, payload, rest] = match;

    userSignalHandler(userId, type, payload);

    if (rest) {
      userInputHandler(userId, rest);
    }
    return;
  }

  console.log("%d: %s", userId);
  if (!users[userId]) console.error("user not ready!");
  users[userId].streamOut.write("+" + data, "utf8");
}

function userSignalHandler(userId, type, payload) {
  if (type === "size") {
    const [rows, cols] = payload.split(",");
    users[userId].rows = rows;
    users[userId].cols = cols;
  }
}

function userJoined(userId) {
  let char = util.randomChoice("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  let startRealm = "city";
  let spawnPoint = world.getPlayerSpawn(startRealm);
  let entity = world.createEntity(
    startRealm,
    "player",
    char,
    "blue",
    spawnPoint.x,
    spawnPoint.y
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
          users[userId] = { ready: false };
        }

        if (pipeType == "in" && !users[userId].streamIn) {
          console.log("create streamIn");
          users[userId].streamIn = fs.createReadStream(
            path.join(CONS_PATH, pipeName)
          );
          users[userId].streamIn.on("data", data =>
            userInputHandler(userId, data.toString("utf8"))
          );
        } else if (pipeType == "out" && !users[userId].streamOut) {
          console.log("create streamOut");
          users[userId].streamOut = fs.createWriteStream(
            path.join(CONS_PATH, pipeName)
          );
        }

        if (users[userId].streamIn && users[userId].streamOut) {
          users[userId].ready = true;
          userJoined(userId);
        }
      }
    });
  });
}

function watch() {
  console.log("watching");
  setInterval(() => {
    checkForPipes();
  }, 250);
}

module.exports = { watch, users };
