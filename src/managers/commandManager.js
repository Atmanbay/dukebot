import { find } from 'lodash';
import minimist from 'minimist';
import ConversionManager from './conversionManager';

export default class CommandManager {
  constructor(config) {
    this.commands = [];
    this.prefix = config.find({ key: 'commandPrefix' }).value().value;
  }
  
  addCommand(command) {
    this.commands.push(command);
  }

  resolveMessage(msg) {
    if (!this.isCommand(msg))
      return;

    this.parseArguments(msg)
      .then(this.convertArguments)
      .then(this.createPayload)
      .then(this.fetchCommand.bind(this))
      .then(this.executeCommand)
      .catch(function(error) {
        msg.channel.send(`Error encountered: ${error}`);
      });
  }

  isCommand(msg) {
    return msg.content.startsWith(this.prefix);
  }

  parseArguments(msg) {
    let prefix = this.prefix;
    return new Promise(function(resolve, reject) {
      let content = msg.content.substring(prefix.length);
      let regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
      let matches = [...content.matchAll(regex)];

      let argv = [];
      for(let i = 0; i < matches.length; i++) {
        let match = matches[i];
        if (!match)
          continue;
        
        if (match[1])
          argv.push(match[1]);
        else
          argv.push(match[0]);
      }

      let args = minimist(argv);
      if (args._.length != 1)
        throw "Invalid arguments. Did you forget quotes?";

      let commandWord = args._[0];
      delete args._;

      resolve({
        command: null,
        commandWord: commandWord,
        arguments: args,
        msg: msg,
        execute: function() {
          this.command.execute(this.msg, this.arguments);
        }
      });
    });
  }

  convertArguments(payload) {
    let conversionManager = new ConversionManager(payload.msg.guild);
    let promises = Object.keys(payload.arguments).map(key => {
      let argument = payload.arguments[key];
      if (Array.isArray(argument)) {
        let arrayPromises = argument.map(argument => {
          return conversionManager.convert(argument);
        });

        return Promise.all(arrayPromises).then((newArrayValues) => {
          return [key, newArrayValues];
        })
      } else {
        return conversionManager.convert(argument).then((newValue) => {
          return [key, newValue];
        });
      }
    });

    return Promise.all(promises).then((newArgs) => {     
      payload.arguments = Object.fromEntries(newArgs);
      return payload;
    });
  }

  fetchCommand(payload) {
    let commands = this.commands;
    return new Promise(function(resolve, reject) {
      let command = find(commands, (command) => {
        return command.isMatch(payload.msg, payload.commandWord);
      });
      
      if (!command) {
        reject('No command found');
      }

      payload.command = command;
      delete payload.commandWord;
      resolve(payload);
    });
  }

  executeCommand(payload) {
    return new Promise(function(resolve, reject) {
      try {
        resolve(payload.execute());
      } catch (error) {
        reject(error);
      }
    })
  }
}