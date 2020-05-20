import { sync } from 'glob';
import Command from "../structures/command";

let commandInstance = Object.getPrototypeOf(new Command());
let files = sync('**/*.js', { cwd: `${__dirname}/` }); // gets all files in current directory
let instances = files.map(filename => require(`./${filename}`)); // requires each file
let commands = instances.filter(instance => Object.getPrototypeOf(instance.default) == commandInstance); // filters instances to only get Routers

export default commands;