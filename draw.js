const chalk = require("chalk");

const { users, getEntityById, getRealmSize } = require("./data");

let TOP_HUD_SIZE = 4;
let BOTTOM_HUD_SIZE = 4;

const colors = {
  brown: "#ce802b",
  dgrey: "#4c4c4c",
  green: "#306312",
  grey: "#777777",
  lbrown: "#d19440",
  yellow: "#ffe900",
  dyellow: "#c6b900",
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

function getGameViewSize(user) {
  return {
    x: user.cols,
    y: user.rows - TOP_HUD_SIZE - BOTTOM_HUD_SIZE
  };
}

function setCursor(streamOut, x, y) {
  streamOut.write(`\u001b[${y};${x}H`, "utf8");
}

function drawHudLine(streamOut, len) {
  for (let x = 0; x < len; x++) {
    if (x == 0 || x == len - 1) {
      streamOut.write("+", "utf8");
    } else {
      streamOut.write("-", "utf8");
    }
  }
}

function drawTopHud(user) {
  for (let y = 1; y <= TOP_HUD_SIZE; y++) {
    setCursor(user.streamOut, 0, y + 1);
  }
  setCursor(user.streamOut, 0, TOP_HUD_SIZE);
  drawHudLine(user.streamOut, user.cols);
}

function drawBottomHud(user) {
  setCursor(user.streamOut, 0, user.rows - BOTTOM_HUD_SIZE + 1);
  drawHudLine(user.streamOut, user.cols);
  for (let y = 2; y <= BOTTOM_HUD_SIZE; ++y) {
    setCursor(user.streamOut, 0, user.rows - BOTTOM_HUD_SIZE + y);
  }
}

function drawHud(user) {
  drawTopHud(user);
  drawBottomHud(user);
}

function sendView(user, view) {
  let realmSize = getRealmSize(view.realmName);
  let right = Math.min(realmSize.x, view.right);
  let bottom = Math.min(realmSize.y, view.bottom);
  const gameViewSize = getGameViewSize(user);
  let cursorX = 0;
  if (realmSize.x < view.right - view.left)
    cursorX = Math.floor(gameViewSize.x / 2) - Math.floor(realmSize.x / 2);
  let cursorY = TOP_HUD_SIZE + 1;
  if (realmSize.y < view.bottom - view.top)
    cursorY += Math.floor(gameViewSize.y / 2) - Math.floor(realmSize.y / 2);
  for (let y = view.top; y < bottom; y++) {
    setCursor(user.streamOut, cursorX, cursorY);
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

      user.streamOut.write(seq, "utf8");
    }
    cursorY++;
  }

  drawHud(user);
}

function checkRedraw() {
  Object.values(users).forEach(user => {
    const entity = getEntityById(user.entityId);
    const rs = getRealmSize(entity.realmName);

    const view = {};
    const gameViewSize = getGameViewSize(user);
    view.realmName = entity.realmName;
    view.left = Math.max(
      Math.min(
        entity.x - Math.floor(gameViewSize.x / 2),
        rs.x - gameViewSize.x
      ),
      0
    );
    view.top = Math.max(
      Math.min(
        entity.y - Math.floor(gameViewSize.y / 2),
        rs.y - gameViewSize.y
      ),
      0
    );
    view.right = view.left + gameViewSize.x;
    view.bottom = view.top + gameViewSize.y;

    if (user.needsFullDraw || viewIsDirty(view)) {
      if (user.needsFullDraw) {
        console.log("draw:clear", user.id);
        clearScreen(user.streamOut);
        user.needsFullDraw = false;
      }
      console.log("draw:send-view", user.id);
      sendView(user, view);
    }
  });

  // for each player, check if mapBuffer has to be redrawn, then send new mapBuffer
  redrawPending = false;
  dirtyTiles = [];
}

module.exports = { setMap, queueDrawCheck };
