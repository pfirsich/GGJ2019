const chalk = require("chalk");

const { users, getEntityById, getRealmSize } = require("./data");

const colors = {
  brown: "#ce802b",
  dgrey: "#4c4c4c",
  green: "#306312",
  grey: "#777777",
  lbrown: "#d19440",
  yellow: "#ffe900",
  blue: "#003bff"
};

const mapBuffer = {}; // mapBuffer[realmName][y][x] = { bgColor, color, character }

let redrawPending = false;
let dirtyTiles = [];

function setMap(realmName, x, y, bgColor, color, character) {
  if (!mapBuffer[realmName]) mapBuffer[realmName] = {};
  if (!mapBuffer[realmName][y]) mapBuffer[realmName][y] = {};

  mapBuffer[realmName][y][x] = { bgColor, color, character };

  dirtyTiles.push({ realmName, x, y });

  queueDrawCheck();
}

function queueDrawCheck() {
  if (!redrawPending) {
    console.log("draw:queue-check");
    setTimeout(checkRedraw, 50);
    redrawPending = true;
  }
}

function viewIsDirty(view) {
  return dirtyTiles.some(({ realmName, x, y }) => {
    return (
      view.realmName === realmName &&
      x >= view.left &&
      y >= view.top &&
      x <= view.right &&
      y <= view.bottom
    );
  });
}

function clearScreen(streamOut) {
  streamOut.write(`\u001b[2J`, "utf8");
}

function sendView(streamOut, view) {
  let realmSize = getRealmSize(view.realmName);
  let right = Math.min(realmSize.x, view.right);
  let bottom = Math.min(realmSize.y, view.bottom);
  streamOut.write(`\u001b[${0};${0}H`, "utf8");
  for (let y = view.top; y < bottom; y++) {
    for (let x = view.left; x < right; x++) {
      if (!mapBuffer[view.realmName][y] || !mapBuffer[view.realmName][y][x]) {
        throw new Error(`Out of bounds ${x}, ${y}, ${view}`);
      }

      let { bgColor, color, character } = mapBuffer[view.realmName][y][x];
      let seq = character || " ";

      if (seq !== " ") {
        // if (bgColor && colors[bgColor]) {
        //   seq = chalk.bgHex(colors[bgColor])(seq);
        // }
        if (color && colors[color]) {
          seq = chalk.hex(colors[color])(seq);
        }
      }

      streamOut.write(seq, "utf8");
    }
    if (y < bottom - 1) {
      streamOut.write("\n", "utf8");
    }
  }
}

function checkRedraw() {
  Object.values(users).forEach(user => {
    const entity = getEntityById(user.entityId);
    const rs = getRealmSize(entity.realmName);

    const view = {};
    view.realmName = entity.realmName;
    view.left = Math.max(
      Math.min(entity.x - Math.floor(user.cols / 2), rs.x - user.cols),
      0
    );
    view.top = Math.max(
      Math.min(entity.y - Math.floor(user.rows / 2), rs.y - user.rows),
      0
    );
    view.right = view.left + user.cols;
    view.bottom = view.top + user.rows;

    if (user.needsFullDraw || viewIsDirty(view)) {
      if (user.needsFullDraw) {
        console.log("draw:clear", user.id);
        clearScreen(user.streamOut);
        user.needsFullDraw = false;
      }
      console.log("draw:send-view", user.id);
      sendView(user.streamOut, view);
    }
  });

  // for each player, check if mapBuffer has to be redrawn, then send new mapBuffer
  redrawPending = false;
  dirtyTiles = [];
}

module.exports = { setMap, queueDrawCheck };
