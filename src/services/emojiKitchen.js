const emojiUnicode = require("emoji-unicode");

module.exports = class {
  getCombinedEmoji(a, b) {
    let aUnicode = emojiUnicode(a);
    let bUnicode = emojiUnicode(b);

    let smaller = aUnicode;
    let bigger = bUnicode;
    if (smaller > bigger) {
      smaller = bUnicode;
      bigger = aUnicode;
    }

    let url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${smaller}/u${smaller}_u${bigger}.png`;

    return url;
  }
};
