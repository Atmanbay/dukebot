import { sync } from 'glob';

export default class LoaderService {
  load(path) {
    let files = sync('**/*.js', { cwd: `${path}/` });
    let imports = files.map(filename => require(`${path}/${filename}`).default);

    return imports;
  }
};