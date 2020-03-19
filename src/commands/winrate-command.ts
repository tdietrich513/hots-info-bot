import { RichEmbed, Message, GuildChannel } from "discord.js";
import { Command } from "discord-akairo";
import * as _ from "lodash";

import { IWinRate } from "../interfaces";
import HeroData from "../hero-data";
import canUseEmbeds from "../can-use-embeds";
import { renderWinRateBarChart } from "../responses";
import { HeroRoles } from "../hero-roles";

class WinRateCommand extends Command {
  constructor() {
    super("winrate", {
      cooldown: 1000,
      ratelimit: 1
    });
    super.condition = this.testMessage;
  }

  pattern: RegExp = /\[\[(winrate|wr|wins|win)\/(all|[a-z\s]+)\]\]/i;

  testMessage(message: Message): boolean {
    return this.pattern.test(message.cleanContent);
  }

  topWins(message: Message): any {
    const top10 = _.chain(HeroData.winrates)
      .filter((wr: IWinRate) => (wr.games + wr.banCount) / HeroData.totalGames > .1)
      .sortBy((wr: IWinRate) => -wr.winRate)
      .take(10)
      .value();

    let response = "Top 10 Win Rates in the last 7 days (with >10% pick+ban rate):";
    response += renderWinRateBarChart(top10);

    return message.channel.send(response);
  }

  topWinsByRole(message: Message, role: string): any {
    const roleHeroes = new HeroRoles().getHeroesByRole(role);

    const top10 = _.chain(HeroData.winrates)
      .filter((wr: IWinRate) => roleHeroes.some(name => wr.hero.toLowerCase() == name))
      .sortBy((wr: IWinRate) => -wr.winRate)
      .take(10)
      .value();

    let response = `Top 10 ${_.startCase(role)} WinRates in the last 7 days:`;
    response += renderWinRateBarChart(top10);

    return message.channel.send(response);
  }

  public exec(message: Message): any {
    const matches = message.cleanContent.match(this.pattern);
    const type = matches[2].toLowerCase();
    if (type == "all") {
      return this.topWins(message);
    }
    return this.topWinsByRole(message, type);
  }
}

module.exports = WinRateCommand;