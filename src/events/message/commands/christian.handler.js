export default class {
  get details() {
    return {
      description: "Helpful reminder",
    };
  }

  async execute({ message }) {
    message.channel.send("https://i.redd.it/nq4wp5oi6xky.jpg");
  }
}
