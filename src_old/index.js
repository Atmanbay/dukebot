require("core-js/stable");
require("regenerator-runtime/runtime");
const Bot = require("./bot/bot.js");

function main() {
  let dukeBot = new Bot();
  dukeBot.start();
}

main();
