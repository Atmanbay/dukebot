import Bot from "./bot/bot";
import "core-js/stable";
import "regenerator-runtime/runtime";

function main() {
  let dukeBot = new Bot();
  dukeBot.start();
}

main();
