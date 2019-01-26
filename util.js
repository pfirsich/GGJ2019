function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ghettoCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.export = { randomChoice, ghettoCopy };
