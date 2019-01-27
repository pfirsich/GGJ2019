const fs = require("fs");
const path = require("path");

const { users, getEntityById } = require("./data");
const world = require("./world");
const util = require("./util");

const CONS_PATH = path.join(__dirname, "cons");
const SIGNAL_PATTERN = /^<==>(.+?):(.+?)\.(.*)/;
const ESC_PATTERN = /^\u001b\[(.)(.*)/;

function userInputHandler(userId, data) {
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
    console.log("esc");
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

    if (rest) {
      userInputHandler(userId, rest);
    }
    return;
  }

  console.log("%d: %s", userId, data);
  if (!users[userId]) console.error("user not ready!");
}

function userSignalHandler(userId, type, payload) {
  if (type === "size") {
    const [rows, cols] = payload.split(",");
    users[userId].rows = parseInt(rows, 10);
    users[userId].cols = parseInt(cols, 10);

    console.log(
      "term size",
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
      color: "blue"
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
          users[userId] = { id: userId, ready: false };
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

        if (
          !users[userId].ready &&
          users[userId].streamIn &&
          users[userId].streamOut
        ) {
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

module.exports.watch = watch;
module.exports.users = users;
