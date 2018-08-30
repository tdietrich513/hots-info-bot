import { RichEmbed, Message, GuildChannel } from "discord.js";
import { Command } from "discord-akairo";

import { outputSkillsOrTalents } from "../responses";
import canUseEmbeds from "../can-use-embeds";
import HeroData from "../hero-data";

import * as _ from "lodash";

class SkillOrTalentSearchCommand extends Command {
  constructor() {
    super("skillOrTalentSearch", {
      cooldown: 1000,
      ratelimit: 4
    });
    super.condition = this.testMessage;
  }

  pattern: RegExp = /\[\[[\w\s\-\'\:]+?\]\]/ig;
  testMessage(message: Message): boolean {
    if (!this.pattern.test(message.cleanContent)) {
      return false;
    }
    const rawSearches = message.cleanContent.match(this.pattern);
    const searches = this.cleanSearches(rawSearches);
    const stSearches = this.nonHeroSearches(searches);
    return stSearches.length > 0;
  }

  nonHeroSearches(searches: string[]): string[] {
    return searches.filter(hero => {
      const searchHero = HeroData.makeSearchableName(hero);
      return !HeroData.heroNames.some(hn => hn == searchHero);
    });
  }

  cleanSearches(searches: RegExpMatchArray): string[] {
    return _.chain(searches)
      .map(m => m.replace(/(\[|\])/ig, "").replace(/\s/ig, " ").trim())
      .uniqBy(m => m)
      .value();
  }

  public exec(message: Message): any {
    const rawSearches = message.cleanContent.match(this.pattern);
    const searches = this.cleanSearches(rawSearches);
    let stSearches = this.nonHeroSearches(searches);
    if (stSearches.length == 0) return;
    if (stSearches.length > 4) {
      message.reply("sorry, I can only display up to 4 searches at a time.");
      stSearches = stSearches.slice(0, 4);
    }
    const useEmbeds = canUseEmbeds(message);

    stSearches.forEach(search => {
      if (search.trim() == "") {
        return message.reply(`You're going to have to give me _something_ to look for.`);
      }

      const results = HeroData.findSkillOrTalent(search);

      return outputSkillsOrTalents(results, search, message, useEmbeds);
    });
  }
}

module.exports = SkillOrTalentSearchCommand;