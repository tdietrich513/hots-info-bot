import { RichEmbed, Message, GuildChannel } from "discord.js";
import { Command } from "discord-akairo";

import { outputSkillsOrTalents } from "../responses";
import canUseEmbeds from "../can-use-embeds";
import HeroData from "../hero-data";

import * as _ from "lodash";

class DescriptionSearchCommand extends Command {
  constructor() {
    super("descriptionSearch", {
      cooldown: 1000,
      ratelimit: 1
    });
    super.condition = this.testMessage;
  }

  pattern: RegExp = /\[\[\?[\w\s]+?\]\]/ig;
  testMessage(message: Message): boolean {
    if (!this.pattern.test(message.cleanContent)) {
      return false;
    }
    const rawSearches = message.cleanContent.match(this.pattern);
    const searches = this.cleanSearches(rawSearches);
    return searches.length > 0;
  }

  cleanSearches(searches: RegExpMatchArray): string[] {
    return _.chain(searches)
      .map(m => m.replace(/(\[|\]|\?)/ig, "").replace(/\s/ig, " ").trim())
      .uniqBy(m => m)
      .value();
  }

  public exec(message: Message): any {
    const rawSearches = message.cleanContent.match(this.pattern);
    let searches = this.cleanSearches(rawSearches);
    if (searches.length == 0) return;
    if (searches.length > 4) {
      message.reply("sorry, I can only display 1 search at a time.");
      searches = searches.slice(0, 1);
    }
    if (searches[0].length < 4) {
      message.reply(`${searches[0]} is a little short, give me something longer to search for please.`);
    }
    const useEmbeds = canUseEmbeds(message);

    searches.forEach(search => {
      if (search.trim() == "") {
        return message.reply(`You're going to have to give me _something_ to look for.`);
      }

      const results = HeroData.descriptionSearch(search);

      return outputSkillsOrTalents(results, search, message, useEmbeds);
    });
  }
}

module.exports = DescriptionSearchCommand;