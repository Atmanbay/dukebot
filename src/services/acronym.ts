import { filter, sample } from "lodash-es";
import { messages } from "./database.js";

export const acronymize = async (word: string): Promise<string[]> => {
  let allMessages = await messages.list();
  let wordObjects: { letter: string; word: string }[] = [];
  allMessages.forEach((m) => {
    m.content
      .split(" ")
      .filter((w) => w)
      .forEach((w) => {
        wordObjects.push({
          letter: w[0].toLowerCase(),
          word: w[0].toUpperCase() + w.substring(1),
        });
      });
  });

  let response = word.split("").map((letter) => {
    let matchingWords = filter(wordObjects, {
      letter: letter.toLowerCase(),
    }); // get all matching words
    let result = sample(matchingWords.map((mw) => mw)); // get a random element
    if (!result) {
      return null;
    }
    let trimmedWord = result.word.match(/\w+/)[0];
    return trimmedWord;
  });

  return response;
};
