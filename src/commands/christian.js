import Command from "../objects/command";

export default class AliveCommand extends Command {
  constructor() {
    super();
    this.details = {
      name: "christian",
      description: "Helpful reminder",
    };
  }

  execute(message) {
    message.channel.send("https://i.redd.it/nq4wp5oi6xky.jpg");
  }
}
