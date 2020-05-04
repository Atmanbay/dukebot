import { sync } from 'glob';
import EventHandler from "../structures/eventHandler";

var files = sync('**/*.js', { cwd: `${__dirname}/` }); // gets all files in current directory
var instances = files.map(filename => require(`./${filename}`)); // requires each file
var handlers = instances.filter(instance => Object.getPrototypeOf(instance.default) == EventHandler); // filters instances to only get Routers

export default handlers;