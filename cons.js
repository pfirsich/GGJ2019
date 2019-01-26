const fs = require("fs");
const path = require("path");

const CONS_PATH = path.join(__dirname, "cons");

let users = {};

function userInputHandler(userId, data) {
  console.log("%d: %s", userId, data.toString("utf8"));
  if (!users[userId]) console.error("user not ready!");
  users[userId].streamOut.write("+" + data.toString("utf8"), "utf8");
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
          users[userId].streamIn.on(
            "data",
            userInputHandler.bind(null, userId)
          );
        } else if (pipeType == "out" && !users[userId].streamOut) {
          console.log("create streamOut");
          users[userId].streamOut = fs.createWriteStream(
            path.join(CONS_PATH, pipeName)
          );
        }

        if (users[userId].streamIn && users[userId].streamOut) {
          users[userId].ready = true;
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

module.exports = { watch };
