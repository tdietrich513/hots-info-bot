import { RichEmbed, Message, GuildChannel } from "discord.js";
import { Command } from "discord-akairo";
import * as _ from "lodash";

import { IWinRate } from "../interfaces";
import HeroData from "../hero-data";
import canUseEmbeds from "../can-use-embeds";

class BansCommand extends Command {
  constructor() {
    super("bans", {
      cooldown: 1000,
      ratelimit: 1
    });
    super.condition = this.testMessage;
  }

  pattern: RegExp = /\[\[bans\/(all|warrior|support|specialist|assassin)\]\]/i;

  testMessage(message: Message): boolean {
    return this.pattern.test(message.cleanContent);
  }

  topBans(message: Message): any {
    let response = "Top 10 Most Popular Bans:";
    const top10 = _.chain(HeroData.winrates)
      .sortBy((wr: IWinRate) => -wr.banCount)
      .take(10)
      .value();

    top10.forEach((wr: IWinRate, i: number) => {
      response += `\n\t${i + 1}:\t${wr.hero}`;
    });

    return message.channel.send(response);
  }

  topBansByRole(message: Message, role: string): any {
    const roleHeroes = _.chain(HeroData.heroes)
      .filter(hd => hd.role.toLowerCase() == role.toLowerCase())
      .map(hd => hd.name.toLowerCase())
      .value();

    const top10 = _.chain(HeroData.winrates)
      .filter((wr: IWinRate) => roleHeroes.some(name => wr.hero.toLowerCase() == name))
      .sortBy((wr: IWinRate) => -wr.banCount)
      .take(10)
      .value();

    let response = `Top 10 Most Popular ${role} Bans:`;
    top10.forEach((wr: IWinRate, i: number) => {
      response += `\n\t${i + 1}:\t${wr.hero}`;
    });

    return message.channel.send(response);
  }

  public exec(message: Message): any {
    const matches = message.cleanContent.match(this.pattern);
    const type = matches[1].toLowerCase();
    if (type == "all") {
      return this.topBans(message);
    }
    return this.topBansByRole(message, type);
  }
}

module.exports = BansCommand;