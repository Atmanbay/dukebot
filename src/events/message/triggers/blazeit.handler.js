export default class {
  constructor(services) {
    this.blazeService = services.blaze;
  }

  get details() {
    return {
      description: "Trigger command to count blaze its at 4:20 AM and PM",
    };
  }

  isMatch(message) {
    if (!message.content.toLowerCase().includes("blaze it")) {
      return false;
    }

    if (!this.blazeService.isBlazingMinute(message.createdAt)) {
      return false;
    }

    return true;
  }

  execute(message) {
    if (this.blazeService.trySaveBlaze(message.author)) {
      // Gives user feedback that the blaze it was counted
      message.react("🔥");
    }
  }
}
