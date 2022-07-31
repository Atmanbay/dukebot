const googleTTS = require("google-tts-api");

module.exports = class {
  getAudioUrl({ text, lang, slow }) {
    return googleTTS.getAudioUrl(text, {
      lang,
      slow,
    });
  }
};
