const isEmpty = require("lodash/isEmpty");
const sample = require("lodash/sample");
const countBy = require("lodash/countBy");
const some = require("lodash/some");

const RESULT = {
  WRONG: 0,
  CONTAINS: 1,
  CORRECT: 2,
};

module.exports = class {
  constructor(services) {
    this.loggingService = services.logging;
    this.words = services.database.get("words").value();
    this.db = services.database.get("wordle");
    this.RESULT = RESULT;
  }

  isValidGuess(userId, guess) {
    if (!(typeof guess == "string" || guess instanceof String)) {
      return false;
    }

    let currentWord = this.getCurrentWord(userId);
    if (guess.length !== currentWord.length) {
      return false;
    }

    if (!this.words.includes(guess)) {
      return false;
    }

    let guesses = this.getGuesses(userId);
    if (guesses.includes(guess)) {
      return false;
    }

    return true;
  }

  getCurrentWord(userId) {
    let dbUser = this.db.find({ id: userId });
    if (isEmpty(dbUser.value())) {
      return null;
    } else {
      return dbUser.value().word;
    }
  }

  getGuesses(userId) {
    let dbUser = this.db.find({ id: userId });
    if (isEmpty(dbUser.value())) {
      return [];
    }
    return dbUser.value().guesses;
  }

  getHints(userId) {
    let dbUser = this.db.find({ id: userId });
    if (isEmpty(dbUser.value())) {
      return [];
    }
    return dbUser.value().hints;
  }

  getWordId(word) {
    return this.words.indexOf(word);
  }

  assignWord(userId, { word, length, wordID }) {
    let dbUser = this.db.find({ id: userId });
    if (wordID) {
      word = this.words[wordID];
      length = word.length;
    } else if (!word) {
      word = sample(
        this.words.filter((word) => word.length === length)
      ).toUpperCase();
    } else {
      length = word.length;
    }

    if (isEmpty(dbUser.value())) {
      this.db
        .push({
          id: userId,
          word: word,
          hints: {
            known: Array(length).fill("_"),
            unknown: [],
          },
          guesses: [],
        })
        .write();
    } else {
      dbUser
        .assign({
          word: word,
          hints: {
            known: Array(length).fill("_"),
            unknown: [],
          },
          guesses: [],
        })
        .write();
    }

    return word;
  }

  logGuess(userId, guess) {
    let word = this.getCurrentWord(userId);
    if (!word) {
      return;
    }

    let wordArray = word.split("");
    let guessArray = guess.split("");
    let wordCountBy = countBy(wordArray);
    let guessCountBy = countBy(guessArray);

    let hints = this.getHints(userId);

    guessArray.forEach((letter, index) => {
      if (wordArray[index] === letter) {
        hints.known[index] = letter;

        let wordInstancesOf = wordCountBy[letter];
        let guessInstancesOf = guessCountBy[letter];

        if (guessInstancesOf >= wordInstancesOf) {
          let index = hints.unknown.indexOf(letter);
          if (index > -1) {
            hints.unknown.splice(index, 1);
          }
        }
      }
    });

    let knownCountBy = countBy(hints.known);

    guessArray.forEach((letter, index) => {
      if (hints.known[index] === letter) {
        return;
      }

      if (!wordArray.includes(letter)) {
        return;
      }

      let wordInstancesOf = wordCountBy[letter];
      let guessInstancesOf = guessCountBy[letter];
      let knownInstancesOf = knownCountBy[letter];

      if (
        wordInstancesOf == guessInstancesOf &&
        knownInstancesOf !== guessInstancesOf
      ) {
        if (!hints.unknown.includes(letter)) {
          hints.unknown.push(letter);
        }
      }
    });

    let dbUser = this.db.find({ id: userId });
    dbUser
      .update(`hints`, () => {
        return hints;
      })
      .update(`guesses`, (guesses) => {
        guesses.push(guess);
        return guesses;
      })
      .write();
  }
};
