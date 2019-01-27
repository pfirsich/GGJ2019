#!/usr/bin/env node

const fs = require("fs");
const util = require("util");

const colorize = (str, colorCodes) =>
  `\x1b[${colorCodes[0]}m${str}\x1b[${colorCodes[1]}m`;

const red = str => colorize(str, util.inspect.colors.red);
const yellow = str => colorize(str, util.inspect.colors.yellow);

const SIGNAL_TOKEN = "<==>";

const pipeNameIn = process.argv[2];
const streamIn = fs.createWriteStream(pipeNameIn);
process.stdin.setRawMode(true);

let end = false;

process.stdin.on("data", data => {
  const text = data.toString("utf8");
  if (text === "\u0003") {
    process.stdin.setRawMode(false);
    process.stdout.write(data);
    streamOut.unpipe();
    streamOut.close();
    streamIn.close();
    end = true;
  } else if (!end) {
    streamIn.write(data, "utf8");
  }
});
streamIn.on("error", logError);

const pipeNameOut = process.argv[3];
const streamOut = fs.createReadStream(pipeNameOut);
streamOut.pipe(process.stdout);
streamOut.on("error", logError);

signal("size", `${process.stdout.rows},${process.stdout.columns}`);

function signal(type, payload) {
  streamIn.write(`${SIGNAL_TOKEN}${type}:${payload}.`, "utf8");
}

function logError(error) {
  console.log(
    red(`
              ___     __             __
  ________   /   |   / /___   _____ / /_   ________
 /_______/  / /| |  / // _ \\ / ___// __/  /_______/
/_______/  / ___ | / //  __// /   / /_   /_______/
          /_/  |_|/_/ \\___//_/    \\__/
          `)
  );

  console.log(yellow(error));
  process.exit(1);
}

process.on("SIGINT", () => {
  console.log(yellow("SIGINT"));
  process.exit(1);
});
