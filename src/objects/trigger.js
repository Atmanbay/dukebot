export default class Trigger {
  // Unlike commands, you will need to override this for all triggers
  isMatch(message) { 
    return false;
  }

  // This method will contain the actual trigger logic
  execute(message) { }
}