import { merge } from 'lodash';
import config from '../config.js';

// Just a fancy wrapper for the config.js file at the project's root dir
export default class ConfigService {
  constructor() {
    merge(this, config);
  }
}