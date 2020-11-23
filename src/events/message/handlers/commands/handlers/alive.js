export default class {
  get details() {
    return {
      description: "Check if the bot is alive",
    };
  }

  execute({ message }) {
    message.channel.send("I'm alive!");
  }
}
