const fs = require("fs");
const path = require("path");

let world = {}; // world[realmId] = array of entities
let map = {}; // map[realmId] = array of arrays of tuples (color, char)
//map[realmId][y][x] = [color, char];

let defaultColors = {};
let colors = { white: 0xffffff };

function init() {
  let realmsRoot = path.join(__dirname, "realms");
  let realmFiles = fs.readdirSync(realmsRoot);
  let values = {};
  realmFiles.forEach(realmName => {
    let fileData = fs.readFileSync(path.join(realmsRoot, realmName), "ascii");
    let lines = fileData.split("\n");
    const firstEmptyLineIndex = lines.findIndex(line => !line);
    map[realmName] = lines
      .slice(0, firstEmptyLineIndex)
      .map(line =>
        [...line].map(char => [defaultColors[char] || colors.white, char])
      );
    lines.slice(firstEmptyLineIndex + 1).forEach(line => {
      let [key, val] = line.split(/\s*=\s*/);
      if (key) {
        values[key] = val.split(",");
      }
    });
  });
}

function updateMap() {}

module.exports = { init };
