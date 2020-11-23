export default class {
  get details() {
    return {
      aliases: ["???"],
      description: "When you are confused",
    };
  }

  execute({ message }) {
    message.channel.send("https://i.imgur.com/zvIcNWp.jpg");
  }
}
