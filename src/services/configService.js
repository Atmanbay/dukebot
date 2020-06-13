import { merge } from 'lodash';
import config from '../../config.json';
import fs from 'fs';

// Just a fancy wrapper for the config.json file at the project's root dir
export default class ConfigService {
  constructor() {
    merge(this, config);
  }

  getToken() {
    return fs.readFileSync(this.setup.tokenPath, {encoding: 'utf8'});
  }
}