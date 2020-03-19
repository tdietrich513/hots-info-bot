import { RichEmbed, Message, GuildChannel } from "discord.js";
import { Command } from "discord-akairo";
import * as _ from "lodash";

import { IWinRate } from "../interfaces";
import HeroData from "../hero-data";
import canUseEmbeds from "../can-use-embeds";
import { renderPopularityBarChart } from "../responses";
import { HeroRoles } from "../hero-roles";

class BansCommand extends Command {
  constructor() {
    super("picks", {
      cooldown: 1000,
      ratelimit: 1
    });
    super.condition = this.testMessage;
  }

  pattern: RegExp = /\[\[(picks|pick)\/(all|[a-z\s]+)\]\]/i;

  testMessage(message: Message): boolean {
    return this.pattern.test(message.cleanContent);
  }

  topPicks(message: Message): any {
    const top10 = _.chain(HeroData.winrates)
      .sortBy((wr: IWinRate) => -wr.games)
      .take(10)
      .value();

    let response = "Top 10 Most Popular Picks in the last 7 days:";
    response += renderPopularityBarChart(top10, (wr) => wr.games, "Pick");

    return message.channel.send(response);
  }

  topPicksByRole(message: Message, role: string): any {
    const roleHeroes = new HeroRoles().getHeroesByRole(role);

    const top10 = _.chain(HeroData.winrates)
      .filter((wr: IWinRate) => roleHeroes.some(name => wr.hero.toLowerCase() == name))
      .sortBy((wr: IWinRate) => -wr.games)
      .take(10)
      .value();

    let response = `Top 10 Most Popular ${_.startCase(role)} Picks in the last 7 days:`;
    response += renderPopularityBarChart(top10, (wr) => wr.games, "Pick");

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