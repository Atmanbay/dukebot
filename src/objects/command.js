// Inherit this class to create new commands

export default class Command {
  // This can be overridden (might be useful in the future)
  isMatch(commandWord) {
    return this.details.name === commandWord || (this.details.aliases && this.details.aliases.includes(commandWord));
  }

  // This method will contain the actual command logic
  async execute(message, args) { }
}