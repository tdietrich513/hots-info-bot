import { Command } from "discord-akairo";
import { Message } from "discord.js";
import canUseReactions from "../can-use-reactions";

class HelpCommand extends Command {
  constructor() {
    super("help", {
      aliases: ["help"],
      cooldown: 3000,
      ratelimit: 1
    });
  }

  exec(message: Message) {
    let help = "I can search for heroes, skills and talents by name or description, and talent tiers\n";
    help += "I trigger when I see double square brackets (`[[]]`) in a message, and search on the value within the brackets.\n";
    help += "To search for a hero, search with the hero's exact name, ie: `[[Sgt. Hammer]]`\n";
    help += "To search for a hero's talent tier, search with the hero's name (or part of it), with /tier, ie: `[[Murk/13]]`\n";
    help += "To search for skills or talents across all heroes, just search for the name or part of the name, ie: `[[haunting wave]]`\n";
    help += "To search for skills or talents by key words in the description, prefix with a ?, ie: `[[?chill]]`\n";
    help += "To get Win, Loss, Pick, and Ban information, try `[[wins/all]]` `[[loss/all]]` `[[picks/all]]` and `[[bans/all]]`\n";
    help += "You can also filter win, loss, pick, and ban by role like `[[wins/warrior]]`\n";
    help += "I can also find player MMR by region and battletag- ie: `[[us/player#1234]]`. Valid regions are us, eu, kr, and cn";

    if (canUseReactions(message)) {
      message.react("👍");
    } else {
      message.reply("check your PMs.");
    }
    return message.author.send(help);
  }
}

module.exports = HelpCommand;