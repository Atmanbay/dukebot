import Command from '../structures/command';
import Database from '../database';

export default class JobsCommand extends Command {
  constructor() {
    super();
    this.commandWord = 'jobs';
  }

  execute(msg, args) {
    console.log(args);
  }
}