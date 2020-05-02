import { Message } from "discord.js";
import { Command } from "discord-akairo";
import * as _ from "lodash";

import { outputSkillsOrTalents } from "../responses";
import canUseEmbeds from "../can-use-embeds";
import HeroData from "../hero-data";

class SkillHotkeyCommand extends Command {
  constructor() {
    super("skillhotkey", {
      cooldown: 1000,
      ratelimit: 1
    });
    super.condition = this.testMessage;
  }

  pattern: RegExp = /\[\[[\w\s'\-\.]+\/[qwerdz]\]\]/ig;
  groupPattern: RegExp =  /([\w\s'\-\.]+)\/([qwerdz])/i;
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
    let searches = this.cleanSearches(rawSearches);

    if (searches.length == 0) return;
    if (searches.length > 4) {
      message.reply("sorry, I can only display up to 4 searches at a time.");
      searches = searches.slice(0, 4);
    }

    const useEmbeds = canUseEmbeds(message);
    searches.forEach(search => {
      const [fullMatch, heroSearch, keySearch] = search.match(this.groupPattern);
      const results = HeroData.getSkillByHotkey(heroSearch.trim(), keySearch);
      return outputSkillsOrTalents(results, search, message, useEmbeds);
    });
  }
}

module.exports = SkillHotkeyCommand;