// import "core-js/stable";
// import "regenerator-runtime/runtime";
const Bot = require("./bot/bot.js");

function main() {
  let dukeBot = new Bot();
  dukeBot.start();
}

main();
