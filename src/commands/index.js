import { sync } from 'glob';
import Command from "../structures/command";

var files = sync('**/*.js', { cwd: `${__dirname}/` }); // gets all files in current directory
var instances = files.map(filename => require(`./${filename}`)); // requires each file
var commands = instances.filter(instance => Object.getPrototypeOf(instance.default) == Command); // filters instances to only get Routers

export default commands;