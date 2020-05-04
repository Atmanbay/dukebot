import Command from "../structures/command";

export default class TestCommand extends Command {
  constructor() {
    super();
    this.commandWord = "test";
  }

  execute(msg, args) {
    console.log(args);
  }
}