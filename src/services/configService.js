import { merge } from 'lodash';
import config from '../../config.json';
import fs from 'fs';

export default class ConfigService {
  constructor() {
    merge(this, config);
  }

  getToken() {
    return fs.readFileSync(this.setup.tokenPath, {encoding: 'utf8'});
  }
}