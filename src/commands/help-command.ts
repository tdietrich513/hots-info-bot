import { Command } from "discord-akairo";
import { Message } from "discord.js";

class HelpCommand extends Command {
  constructor() {
    super("help", {
      aliases: ["help"],
      cooldown: 3000,
      ratelimit: 1
    });
  }

  exec(message: Message) {
    let help = "I can search for heroes, skills and talents, and talent tiers\n";
    help += "I trigger when I see double square brackes (`[[]]`) in a message, and search on the value within the brackets.\n";
    help += "To search for a hero, search with the hero's exact name, ie: `[[Sgt. Hammer]]`\n";
    help += "To search for a hero's talent tier, search with the hero's name (or part of it), with /tier, ie: `[[Murk/13]]`\n";
    help += "To search for skills or talents across all heroes, just search for the name or part of the name, ie: `[[haunting wave]]`\n";
    help += "If your search returns too many results, I'll ask you to be more specific!";
    message.reply("Check your PMs.");
    return message.author.send(help);
  }
}

module.exports = HelpCommand;