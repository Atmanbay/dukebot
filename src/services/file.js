import { sync } from "glob";

export default class {
  constructor(services) {
    this.services = services;
  }

  getClasses(pattern, directory) {
    let files = sync(pattern, { cwd: `${directory}/` });
    let classes = {};

    files.forEach((file) => {
      let className = file.replace(".js", "").split("/")[1];
      if (className === "index") {
        className = file.split("/")[0];
      }

      let defaultClass = require(`${directory}/${file}`).default;
      let instance = new defaultClass(this.services);

      classes[className] = instance;
    });

    return classes;
  }
}
