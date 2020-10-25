import Command from "../objects/command";

export default class AliveCommand extends Command {
  constructor(container) {
    super();
    this.details = {
      name: "???",
      description: "When you are confused",
    };
  }

  execute(message) {
    message.channel.send("https://i.imgur.com/zvIcNWp.jpg");
  }
}
