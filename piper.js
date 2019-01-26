#!/usr/bin/env node

const fs = require("fs");

const pipeNameIn = process.argv[2];
const streanIn = fs.createWriteStream(pipeNameIn);
process.stdin.setRawMode(true);
process.stdin.on("data", data => {
  streanIn.write(data);
});

const pipeNameOut = process.argv[3];
const streanOut = fs.createReadStream(pipeNameOut);
streanOut.on("data", data => {
  process.stdout.write(data);
});
