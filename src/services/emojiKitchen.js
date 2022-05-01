const emojiUnicode = require("emoji-unicode");
const request = require("request-promise-native");

module.exports = class {
  async getCombinedEmoji(a, b) {
    let aUnicode = emojiUnicode(a);
    let bUnicode = emojiUnicode(b);

    let url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${aUnicode}/u${aUnicode}_u${bUnicode}.png`;
    await request({ uri: url }).catch(() => {
      url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${bUnicode}/u${bUnicode}_u${aUnicode}.png`;
    });

    await request({ uri: url }).catch(() => {
      url = null;
    });

    return url;
  }
};
