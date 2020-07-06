// import Bot from './bot/bot';
// import 'core-js/stable';
// import 'regenerator-runtime/runtime';

// function main() {
//   let dukeBot = new Bot();
//   dukeBot.start();
// }

// main();

import TinderService from './services/tinderService';

let phoneNumber = '17173290741';
let tinder = new TinderService();
// tinder.requestCode(phoneNumber).then(response => console.log(response));

let code = '615216';
tinder.submitCode(phoneNumber, code).then(response => console.log(response));