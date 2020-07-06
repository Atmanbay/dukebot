import axios from 'axios';
import moment from 'moment';

const headers = Object.freeze({
  app_version: '6.9.4',
  platform: 'ios',
  'User-Agent': 'Tinder/7.5.3 (iPhone; iOS 10.3.2; Scale/2.00)',
  Accept: 'application/json',
});

export default class TinderService {
  constructor() {
    this.randomBuffer = Math.floor(Math.random() * Math.floor(500));
    this.startTime = moment();
  }

  requestCode(phoneNumber) {
    let timeElapsed = moment().diff(this.startTime, 'seconds');
    
    let client = axios.create({
      baseURL: 'https://api.gotinder.com',
    });

    return client
      .post('/v3/auth/login?locale=en', `\n\r\n\u000b${phoneNumber}`, {
        headers: {
          'accept': 'application/json',
          'accept-language': 'en-US,en;q=0.9',
          'app-session-id': '21b16d1f-1e01-4d4a-86bc-d162a3725b87',
          'app-session-time-elapsed': (10000 + this.randomBuffer + timeElapsed).toString(),
          'app-version': '1024300',
          'cache-control': 'no-cache',
          'content-type': 'application/x-google-protobuf',
          'funnel-session-id': '06dab3e16b30e08f',
          'persistent-device-id': 'b7fc711c-4fa7-4811-83be-73ca07535a35',
          'platform': 'web',
          'pragma': 'no-cache',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'tinder-version': '2.43.0',
          'user-session-id': 'null',
          'user-session-time-elapsed': 'null',
          'x-auth-token': '',
          'x-supported-image-formats': 'webp,jpeg'
        }
      })
      .catch(error => console.log(error));
  }

  submitCode(phoneNumber, code) {
    let timeElapsed = moment().diff(this.startTime, 'seconds');

    let client = axios.create({
      baseURL: 'https://api.gotinder.com',
    });

    return client
      .post('/v3/auth/login?locale=en', `\u0012\u0017\n\r\n\u000b${phoneNumber}\u0012\u0006${code}`, {
        headers: {
          'accept': 'application/json',
          'accept-language': 'en-US,en;q=0.9',
          'app-session-id': '21b16d1f-1e01-4d4a-86bc-d162a3725b87',
          'app-session-time-elapsed': (10000 + this.randomBuffer + timeElapsed).toString(),
          'app-version': '1024300',
          'cache-control': 'no-cache',
          'content-type': 'application/x-google-protobuf',
          'funnel-session-id': '06dab3e16b30e08f',
          'persistent-device-id': 'b7fc711c-4fa7-4811-83be-73ca07535a35',
          'platform': 'web',
          'pragma': 'no-cache',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'tinder-version': '2.43.0',
          'user-session-id': 'null',
          'user-session-time-elapsed': 'null',
          'x-auth-token': '',
          'x-supported-image-formats': 'webp,jpeg'
        }
      })
      .then((response) => {
        let data = response.data;
        let regex = RegExp('(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}');

        let match = data.match(regex);
        if (!match) {
          throw(`Couldn't find match in ${data}`);
        }

        return match[0];
      })
      .catch(error => console.log(error));
  }

  login(token) {
    this.client = axios.create({
      baseUrl: 'https://api.gotinder.com',
      headers: {
        'X-Auth-Token': token,
        ...headers
      }
    });
  }

  getProfle() {
    return this.client.get('/profile').then(response => response.data);
  }

  getRecommendations() {
    return this.client.get('/user/recs').then(response => response.data);
  }

  getuser(userId) {
    return this.client.get(`/user/${userId}`).then(response => response.data);
  }

  superLike(userId) {
    return this.client.post(`/like/${userId}/super`).then(response => response.data);
  }

  like(userId) {
    return this.client.get(`/like/${userId}`).then(response => response.data);
  }

  pass(userId) {
    return this.client.get(`/pass/${userId}`).then(response => response.data);
  }

  getMatches(count) {
    return this.client.get('/matches', { count: count }).then(response => response.data);
  }

  getMatch(matchId) {
    return this.client.get(`/matches/${matchId}`).then(response => response.data);
  }

  message({ matchId, message }) {
    return this.client.post(`/user/matches/${matchId}`, { message }).then(response => response.data);
  }

  unmatch(matchId) {
    return this.client.delete(`/user/matches/${matchId}`).then(response => response.data);
  }

  changeLocation({ latitude, longitude }) {
    return this.client.post('/user/ping', { lat: latitude, lon: longitude }).then(response => response.data);
  }
}