import { remove } from 'lodash';

export default class BanService {
  constructor() {
    this.bans = [];
  }

  banUser(userId) {
    this.bans.push(userId);
    return new Promise(resolve => setTimeout(() => resolve(), 300000)).then(() => {
      this.bans = remove(this.bans, userId);
    });
  }

  isBanned(userId) {
    return this.bans.includes(userId);
  }
}