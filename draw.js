let cons = require("./cons");

let map = {}; // map[realmId] = array of arrays of tuples (color, char)

let redrawPending = false;

let colors = { white: 0xffffff };

function setMap(realmId, x, y, color, char) {
  map[realmId][y][x] = [color, char];
  if (!redrawPending) {
    setTimeout(checkRedraw, 50.0);
    redrawPending = true;
  }
}

function checkRedraw() {
  // for each player, check if map has to be redrawn, then send new map
  redrawPending = false;
}

module.export = { setMap };
