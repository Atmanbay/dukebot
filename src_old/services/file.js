const sync = require("glob/sync");
const fs = require("fs");
const path = require("path");

module.exports = class {
  constructor(services) {
    this.services = services;
  }

  getPath(directory, fileName) {
    let names = fs.readdirSync(directory);
    let realPath = "";
    names.forEach((name) => {
      if (name.toLowerCase() === fileName.toLowerCase()) {
        realPath = path.join(directory, name);
      }
    });

    return realPath;
  }

  getClasses(pattern, directory) {
    let files = sync(pattern, { cwd: `${directory}/` });
    let classes = {};

    files.forEach((file) => {
      let className = file.replace(".js", "").split("/")[1];
      if (className === "index") {
        className = file.split("/")[0];
      }

      let defaultClass = require(`${directory}/${file}`);
      let instance = new defaultClass(this.services);

      classes[className] = instance;
    });

    return classes;
  }
};
