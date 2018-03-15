import { RichEmbed, Message, GuildChannel } from "discord.js";
import { Command } from "discord-akairo";
import * as _ from "lodash";

import { SkillFormatter } from "../skill-formatter";
import { TalentFormatter } from "../talent-formatter";
import { ISkillData, ITalentData, IHeroData, ISkillsAndTalentsResult } from "../interfaces";
import { outputSkillsOrTalents, outputHeroOverview, outputHeroTalentTier } from "../responses";
import canUseEmbeds from "../can-use-embeds";
import HeroData from "../hero-data";

class TalentTierCommand extends Command {
  constructor() {
    super("talenttier", {
      cooldown: 1000,
      ratelimit: 1
    });
    super.condition = this.testMessage;
  }

  pattern: RegExp = /\[\[[\w\s'\.]+\/\d{1,2}\]\]/ig;
  testMessage(message: Message): boolean {
    return this.pattern.test(message.cleanContent);
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

    if (searches.length == 0) return;
    if (searches.length > 1) {
      message.reply("sorry, I can only display 1 talent tier at a time.");
    }

    const useEmbeds = canUseEmbeds(message);

    return outputHeroTalentTier(searches[0], message, useEmbeds);
  }
}

module.exports = TalentTierCommand;