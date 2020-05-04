import Command from "../structures/command";

export default class AliveCommand extends Command {
  constructor() {
    super();
    this.commandWord = "alive";
  }

  execute(msg, args) {
    msg.channel.send("I'm alive!");
  }
}