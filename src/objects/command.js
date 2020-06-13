// Inherit this class to create new commands

export default class Command {
  // This can be overridden (might be useful in the future)
  isMatch(commandWord) {
    return this.details.name === commandWord;
  }

  // This method will contain the actual command logic
  execute(message, args) { }
}