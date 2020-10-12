import fs from 'fs';
import { sample } from 'lodash';

export default class EmojifyService {
  constructor(container) {
    this.filePath = container.configService.paths.emojiMappingFile;
  }

  emojifyText(text) {
    let rawData = fs.readFileSync(this.filePath);
    let emojiMapping = JSON.parse(rawData);

    let words = [...text.matchAll(/\w+/g)].map(m => m[0]);
    let newText = text;
    words.forEach(w => {
      let mappings = emojiMapping[w.toLowerCase()];
      if (mappings) {
        newText = newText.replace(w, `${w} ${sample(mappings)}`);
      }
    });
    
    return newText;
  }
}