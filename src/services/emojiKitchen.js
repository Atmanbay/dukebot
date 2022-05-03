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

  getEmojiFilename(a, b) {
    let aUnicode = emojiUnicode(a);
    let bUnicode = emojiUnicode(b);

    if (parseInt(aUnicode, 16) > parseInt(bUnicode, 16)) {
      return `u${bUnicode}_u${aUnicode}.png`;
    } else {
      return `u${aUnicode}_u${bUnicode}.png`;
    }
  }

  async downloadEmoji(a, b, path) {
    console.log("downloading emoji");
    let aUnicode = emojiUnicode(a);
    let bUnicode = emojiUnicode(b);

    let url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${aUnicode}/u${aUnicode}_u${bUnicode}.png`;
    // let succeeded = false;

    let succeeded = await request
      .head(url)
      .then(() => true)
      .catch(() => false);
    if (!succeeded) {
      url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${bUnicode}/u${bUnicode}_u${aUnicode}.png`;
      succeeded = await request
        .head(url)
        .then(() => true)
        .catch(() => false);
    }

    if (succeeded) {
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

    try {
      await request({ uri: url }).pipe(fs.createWriteStream(path));
      succeeded = true;
      console.log("downloaded!");
    } catch (error) {
      url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${bUnicode}/u${bUnicode}_u${aUnicode}.png`;
      succeeded = false;
    }

    if (!succeeded) {
      try {
        await request({ uri: url }).pipe(fs.createWriteStream(path));
        succeeded = true;
        console.log("downloaded!");
      } catch (error) {
        url = null;
        succeeded = false;
      }
    }

    if (succeeded) {
      return path;
    } else {
      return null;
    }
  }

  getCombinedEmojiName(a, b) {
    return `${emojiUtil.find(a).key}_${emojiUtil.find(b).key}`.substring(0, 32);
  }
};
