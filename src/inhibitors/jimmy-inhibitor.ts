import { Inhibitor } from "discord-akairo";
import { Message } from "discord.js";

class JimmyInhibitor extends Inhibitor {
  constructor() {
    super("Jimmy", {
      reason: "They Mentioned Jimmy."
    });
  }

  exec(message: Message): boolean {
    const pattern = /\[\[jimmy\]\]/ig;
    if (pattern.test(message.cleanContent)) {
      message.reply("this is Jimmy, now shut up.");
      return true;
    }

    return false;
  }
}

module.exports = JimmyInhibitor;