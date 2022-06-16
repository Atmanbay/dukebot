const emojiUnicode = require("emoji-unicode");
const emojiUtil = require("node-emoji");
const fs = require("fs");
const request = require("request-promise-native");
const im = require("imagemagick");

module.exports = class {
  constructor(services) {
    this.configService = services.config;
    this.loggingService = services.logging;
  }

  async fetchEmoji(a, b) {
    let fileName = this.getEmojiFilename(a, b);
    let path = `${this.configService.paths.emojiKitchen}/${fileName}`;

    if (!path || !fs.existsSync(path)) {
      path = await this.downloadEmoji(a, b, path);
    }

    if (!path || !fs.existsSync(path)) {
      return null;
    }

    return path;
  }

  getEmoji(emojiName) {
    return emojiUtil.find(emojiName);
  }

  getEmojiCode(emoji) {
    return emojiUnicode(emoji).split(" ");
  }

  getFormattedEmojiCode(emojiCode) {
    if (emojiCode.length === 1) {
      return `u${emojiCode[0]}`;
    } else {
      return `u${emojiCode[0]}-u${emojiCode[1]}`;
    }
  }

  getEmojiFilename(a, b) {
    let aUnicode = this.getEmojiCode(a);
    let bUnicode = this.getEmojiCode(b);

    if (parseInt(aUnicode[0], 16) > parseInt(bUnicode[0], 16)) {
      return `${this.getFormattedEmojiCode(
        bUnicode
      )}_${this.getFormattedEmojiCode(aUnicode)}.png`;
    } else {
      return `${this.getFormattedEmojiCode(
        aUnicode
      )}_${this.getFormattedEmojiCode(bUnicode)}.png`;
    }
  }

  async downloadEmoji(a, b, path) {
    let aUnicode = this.getEmojiCode(a);
    let bUnicode = this.getEmojiCode(b);

    let url = await this.makeRequest(aUnicode, bUnicode, 20201001);

    if (!url) {
      url = await this.makeRequest(bUnicode, aUnicode, 20201001);
    }

    if (!url) {
      url = await this.makeRequest(aUnicode, bUnicode, 20211115);
    }

    if (!url) {
      url = await this.makeRequest(bUnicode, aUnicode, 20211115);
    }

    if (url) {
      return new Promise((resolve) => {
        request({ uri: url })
          .pipe(fs.createWriteStream(path))
          .on("close", () => {
            im.resize(
              {
                srcPath: path,
                dstPath: path,
                width: 64,
              },
              (err, stdout, stderr) => {
                if (err) {
                  console.log(err);
                }
                resolve(path);
              }
            );
          });
      });
    } else {
      return null;
    }
  }

  async makeRequest(first, second, number) {
    let baseUrl = "https://www.gstatic.com/android/keyboard/emojikitchen";

    let url = `${baseUrl}/${number}/${this.getFormattedEmojiCode(
      first
    )}/${this.getFormattedEmojiCode(first)}_${this.getFormattedEmojiCode(
      second
    )}.png`;

    return request
      .head(url)
      .then(() => url)
      .catch(() => null);
  }

  getCombinedEmojiName(a, b) {
    return `${emojiUtil.find(a).key}_${emojiUtil.find(b).key}`.substring(0, 32);
  }
};
