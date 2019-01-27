#!/usr/bin/env node

const fs = require("fs");

const SIGNAL_TOKEN = "<==>";

const pipeNameIn = process.argv[2];
const streamIn = fs.createWriteStream(pipeNameIn);
process.stdin.setRawMode(true);
process.stdin.pipe(streamIn);

const pipeNameOut = process.argv[3];
const streamOut = fs.createReadStream(pipeNameOut);
streamOut.pipe(process.stdout);

signal("size", `${process.stdout.rows},${process.stdout.columns}`);

function signal(type, payload) {
  streamIn.write(`${SIGNAL_TOKEN}${type}:${payload}.`, "utf8");
}
