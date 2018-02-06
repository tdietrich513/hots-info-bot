import { Inhibitor } from "discord-akairo";
import { Message } from "discord.js";

class TicsInhibitor extends Inhibitor {
  constructor() {
    super("Tics", {
      reason: "The command was surrounded by tics"
    });
  }

  exec(message: Message): boolean {
    const pattern = /`\[\[[^\]]+\]\]`/ig;
    if (pattern.test(message.cleanContent)) {
      return true;
    }

    return false;
  }
}

module.exports = TicsInhibitor;