import { RichEmbed, Message, GuildChannel } from "discord.js";
import { Command } from "discord-akairo";

class JimmyCommand extends Command {
  constructor() {
    super("jimmy", {
      trigger:  /\[\[jimmy\]\]/ig
    });
  }

  public exec(message: Message): any {
    message.reply("this is Jimmy, now shut up.");
  }
}

module.exports = JimmyCommand;