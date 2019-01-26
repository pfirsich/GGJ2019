const fs = require("fs");
const path = require("path");

const streamOut = fs.createWriteStream("cons/out");
const streamIn = fs.createReadStream("cons/in");

streamIn.on("data", data => console.log("in", data.toString("utf8")));

let count = 1;

setInterval(() => {
  streamOut.write("c: " + count, "utf8");
  count += 1;
}, 1000);
