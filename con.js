const fs = require("fs");
const path = require("path");

let users = {};

function userInputHandler(userId, data) {
  console.log("%d: %s", userId, data.toString("utf8"));
  if (!users[userId]) console.error("user not ready!");
  users[userId].streamOut.write("MAP UPDATE", "utf8");
}

fs.watch(path.join(__dirname, "cons"), (eventType, pipeName) => {
  if (eventType == "rename") {
    let matchResult = pipeName.match(/user(\d+)-(in|out)/);
    if (matchResult) {
      let [userId, pipeType] = matchResult;
      if (!users[userId]) {
        users[userId] = {
          ready: false
        };
      }
      if (pipeType == "in") {
        users[userId].streamIn = fs.createReadStream(pipeName);
        users[userId].streamIn.on("data", userInputHandler.bind(null, userId));
      }
      if (pipeType == "out") {
        users[userId].streamOut = fs.createWriteStream(pipeName);
      }
      if (users[userId].streamIn && users[userId].streamOut) {
        if (!users[userId].ready) {
          users[userId].ready = true;
        } else {
          console.log("User %d: creation of an additional pipe", userId);
        }
      }
    }
  }
});
