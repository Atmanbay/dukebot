import { RegExp } from 'core-js';
import fs from 'fs';
import { sample } from 'lodash';

export default class EmojifyService {
  constructor(container) {
    this.db = container.databaseService.get('emojis');
    this.filePath = container.configService.paths.emojiMappingFile;
  }

  emojifyText(text) {
    let words = [...text.matchAll(/\S+/g)].map(m => m[0]);
    let newText = text;
    words.forEach(w => {
      let mapping = this.getMapping(w);
      if (mapping) {
        let emoji = sample(mapping);
        let regex = new RegExp(`\\b${w}\\b`);
        newText = newText.replace(regex, `${w} ${emoji}`);
      }
    });
    
    return newText;
  }

  getMapping(word) {
    let mapping = this.db.find({ word: word }).value();
    if (mapping) {
      return mapping.emojis;
    } else {
      return null;
    }
  }

  saveMapping(word, emoji) {
    let dbWord = this.db.find({ word: word });
    if (dbWord.value()) {
      dbWord
        .update('emojis', (emojis) => {
          emojis.push(emoji);
          return emojis;
        })
        .write();
    } else {
      this.db
        .push({
          word: word,
          emojis: [ emoji ]
        })
        .write();
    }
  }

  deleteMapping(word, emoji) {
    let dbWord = this.db.find({ word: word });
    if (dbWord.value()) {
      dbWord
        .update('emojis', (emojis) => {
          let index = emojis.indexOf(emoji);
          if (index > -1) {
            emojis.splice(index, 1);
          }

          return emojis;
        })
        .write();

      dbWord = this.db.find({ word: word });
      if (!dbWord.value().emojis.length) {
        this.db.remove({ word: word }).write();
      }
    }
  }
}