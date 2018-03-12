import { RichEmbed, Message, GuildChannel } from "discord.js";
import { Command } from "discord-akairo";
import * as _ from "lodash";

import { IWinRate } from "../interfaces";
import HeroData from "../hero-data";
import canUseEmbeds from "../can-use-embeds";

class WinRateCommand extends Command {
  constructor() {
    super("winrate", {
      cooldown: 1000,
      ratelimit: 1
    });
    super.condition = this.testMessage;
  }

  pattern: RegExp = /\[\[(winrate|wr|wins|win)\/(all|warrior|support|specialist|assassin)\]\]/i;

  testMessage(message: Message): boolean {
    return this.pattern.test(message.cleanContent);
  }

  topWins(message: Message): any {
    let response = "Top 10 Win Rates in the last 7 days:";
    const top10 = _.chain(HeroData.winrates)
      .sortBy((wr: IWinRate) => -wr.winRate)
      .take(10)
      .value();

    top10.forEach((wr: IWinRate, i: number) => {
      response += `\n\t${i + 1}:\t${wr.hero}\t(${wr.winRate}%)`;
    });

    return message.channel.send(response);
  }

  topWinsByRole(message: Message, role: string): any {
    const roleHeroes = _.chain(HeroData.heroes)
      .filter(hd => hd.role.toLowerCase() == role.toLowerCase())
      .map(hd => hd.name.toLowerCase())
      .value();

    const top10 = _.chain(HeroData.winrates)
      .filter((wr: IWinRate) => roleHeroes.some(name => wr.hero.toLowerCase() == name))
      .sortBy((wr: IWinRate) => -wr.winRate)
      .take(10)
      .value();

    const nameLength = _.chain(top10)
      .map((wr: IWinRate) => wr.hero.length)
      .max()
      .value();

    let response = `Top 10 ${role} WinRates in the last 7 days:`;
    response += "\n```";
    top10.forEach((wr: IWinRate, i: number) => {
      response += `\n${_.padStart((i + 1) + "", 2)}: ${_.padEnd(wr.hero, nameLength)} (${wr.winRate}%)`;
    });
    response += "\n```";

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