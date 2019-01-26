#!/usr/bin/env node

const fs = require("fs");

const fileName = process.argv[2];
const pipe = fs.createWriteStream(fileName);

process.stdin.setRawMode(true);
process.stdin.on("data", data => {
  pipe.write(data);
});
