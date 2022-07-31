module.exports = class {
  constructor(services) {
    this.responseService = services.response;
    this.guildService = services.guild;
  }

  get details() {
    return {
      description: "Trigger that handles custom responses",
    };
  }

  isMatch(message) {
    return this.responseService.getResponder(message.content);
  }

  execute(message) {
    let response = this.responseService.getResponder(message.content);
    response.responses.forEach((response) => {
      if (response.type === "string") {
        message.channel.send(response.value);
      } else if (response.type === "customEmoji") {
        let customEmoji = this.guildService.guild.emojis.resolve(
          response.value
        );
        message.react(customEmoji);
      } else if (response.type === "emoji") {
        message.react(response.value);
      }
    });
  }
};
