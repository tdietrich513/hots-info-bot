import { RichEmbed, Message, GuildChannel } from "discord.js";
import { Command } from "discord-akairo";
import * as _ from "lodash";

import { SkillFormatter } from "../skill-formatter";
import { TalentFormatter } from "../talent-formatter";
import { ISkillData, ITalentData, IHeroData, ISkillsAndTalentsResult } from "../interfaces";
import { outputSkillsOrTalents, outputHeroOverview, outputHeroTalentTier } from "../responses";
import canUseEmbeds from "../can-use-embeds";
import HeroData from "../hero-data";

class SkillOrTalentSearchCommand extends Command {
  constructor() {
    super("search", {
      cooldown: 1000,
      ratelimit: 4
    });
    super.condition = this.testMessage;
  }

  pattern: RegExp = /\[\[[\w\s]+?\]\]/ig;
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
      return !HeroData.heroNames.some(hn => hn == hero.toLowerCase());
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
      return outputSkillsOrTalents(search, message, useEmbeds);
    });
  }
}

module.exports = SkillOrTalentSearchCommand;