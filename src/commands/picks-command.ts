import { RichEmbed, Message, GuildChannel } from "discord.js";
import { Command } from "discord-akairo";
import * as _ from "lodash";

import { IWinRate } from "../interfaces";
import HeroData from "../hero-data";
import canUseEmbeds from "../can-use-embeds";
import { renderWinRateBarChart } from "../responses";

class BansCommand extends Command {
  constructor() {
    super("picks", {
      cooldown: 1000,
      ratelimit: 1
    });
    super.condition = this.testMessage;
  }

  pattern: RegExp = /\[\[(picks|pick)\/(all|warrior|support|specialist|assassin)\]\]/i;

  testMessage(message: Message): boolean {
    return this.pattern.test(message.cleanContent);
  }

  topPicks(message: Message): any {
    const top10 = _.chain(HeroData.winrates)
      .sortBy((wr: IWinRate) => -wr.games)
      .take(10)
      .value();

    let response = "Top 10 Most Popular Picks in the last 7 days:";
    response += renderWinRateBarChart(top10, (wr) => wr.games);

    return message.channel.send(response);
  }

  topPicksByRole(message: Message, role: string): any {
    const roleHeroes = _.chain(HeroData.heroes)
      .filter(hd => hd.role.toLowerCase() == role.toLowerCase())
      .map(hd => hd.name.toLowerCase())
      .value();

    const top10 = _.chain(HeroData.winrates)
      .filter((wr: IWinRate) => roleHeroes.some(name => wr.hero.toLowerCase() == name))
      .sortBy((wr: IWinRate) => -wr.games)
      .take(10)
      .value();

    let response = `Top 10 Most Popular ${role} Picks in the last 7 days:`;
    response += renderWinRateBarChart(top10, (wr) => wr.games);

    return message.channel.send(response);
  }

  public exec(message: Message): any {
    const matches = message.cleanContent.match(this.pattern);
    const type = matches[2].toLowerCase();
    if (type == "all") {
      return this.topPicks(message);
    }
    return this.topPicksByRole(message, type);
  }
}

module.exports = BansCommand;