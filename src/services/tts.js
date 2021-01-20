import request from "request";
import { Transform } from "stream";

export default class {
  constructor(services) {
    this.audioService = services.audio;
    this.db = services.database.get("tts");
    this.loggingService = services.logging;
    this.tableService = services.table;
  }

  play(character, text, channel) {
    var options = {
      method: "POST",
      uri: "https://api.15.ai/app/getAudioFile",
      json: {
        character: character,
        emotion: "Contextual",
        text: text,
        use_diagonal: true,
      },
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "access-control-allow-origin": "*",
        "content-type": "application/json;charset=UTF-8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    };

    try {
      let stream = new Transform();
      stream._transform = function (chunk, encoding, done) {
        this.push(chunk);
        done();
      };

      request(options).pipe(stream);
      this.audioService.play(stream, channel);
    } catch (error) {
      this.loggingService.error(error);
    }
  }

  voiceExists(voice) {
    return this.db.find({ name: voice }).value();
  }

  list() {
    let characters = this.db.value();

    let bySource = {};
    characters.forEach((character) => {
      if (!(character.source in bySource)) {
        bySource[character.source] = [];
      }

      bySource[character.source].push(character.name);
    });

    let rows = [];
    Object.keys(bySource).forEach((source) => {
      let characters = bySource[source];

      rows.push(`**${source}**`);
      characters.forEach((character) => rows.push(character));
      rows.push("");
    });

    return rows;
  }
}
