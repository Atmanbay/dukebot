export default class Command {
  isMatch(commandWord) {
    return this.commandWord === commandWord;
  }

  execute(msg, args) { }
}