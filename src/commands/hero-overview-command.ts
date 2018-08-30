import { RichEmbed, Message, GuildChannel } from "discord.js";
import { Command } from "discord-akairo";
import * as _ from "lodash";

import { SkillFormatter } from "../skill-formatter";
import { TalentFormatter } from "../talent-formatter";
import { ISkillData, ITalentData, IHeroData, ISkillsAndTalentsResult } from "../interfaces";
import { outputSkillsOrTalents, outputHeroOverview, outputHeroTalentTier } from "../responses";
import canUseEmbeds from "../can-use-embeds";
import HeroData from "../hero-data";

class HeroOverviewCommand extends Command {
  constructor() {
    super("hero", {
      cooldown: 15000,
      ratelimit: 1,
    });
    super.condition = this.testMessage;
  }

  pattern: RegExp = /\[\[[\w\s'\-\.]+?\]\]/ig;
  testMessage(message: Message): boolean {
    if (!this.pattern.test(message.cleanContent)) {
      return false;
    }
    const rawSearches = message.cleanContent.match(this.pattern);
    const searches = this.cleanSearches(rawSearches);
    const heroSearches = this.heroSearches(searches);
    return heroSearches.length > 0;
  }

  heroSearches(searches: string[]): string[] {
    return searches.filter(hero => {
      return HeroData.heroNames.some(hn => hn == hero.toLowerCase());
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
    const heroSearches = this.heroSearches(searches);

    if (heroSearches.length == 0) return;

    if (heroSearches.length > 1) {
      message.reply(`Sorry, I can only display one hero at a time, here's ${heroSearches[0]}`);
    }

    return outputHeroOverview(heroSearches[0], message, canUseEmbeds(message));
  }
}

module.exports = HeroOverviewCommand;