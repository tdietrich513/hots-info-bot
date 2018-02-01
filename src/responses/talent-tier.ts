import HeroData from "../hero-data";
import { Message, RichEmbed } from "discord.js";
import { TalentFormatter } from "../talent-formatter";
import * as _ from "lodash";

export function outputHeroTalentTier(search: string, message: Message, useEmbeds: boolean) {
  const heroPattern = /[^\d\/]+/i;
  const tierPattern = /[\d]{1,2}/i;

  const heroSearch = search.match(heroPattern)[0].trim();
  const tierSearch = search.match(tierPattern)[0];

  if (heroSearch == "") {
      return message.reply(`Please provide a hero name to search for talents by tier.`);
  }

  const tier = HeroData.findHeroTalentTier(heroSearch, tierSearch);
  if (tier.length === 0) {
      return message.reply(`Couldn't find a hero talent tier for '${search}'`);
  }
  if (useEmbeds) {
      const embed = new RichEmbed()
          .setColor(0x00AE86)
          .setTitle(`${tier[0].hero} Level ${tier[0].tier} Talents:`);

      tier.forEach(talent => {
          const talentDescription = `\n_${talent.description}_\n\n`;
          embed.addField(`${talent.name}`, talentDescription);
      });

      return message.channel.send({ embed })
          .catch(console.error);
  } else {
      let textResponse = `**${tier[0].hero} Level ${tier[0].tier} Talents**:\n`;
      tier.forEach(talent => {
          textResponse = textResponse + `**${talent.name}**\n`;
          textResponse = textResponse + `_${talent.description}_\n\n`;
      });

      return message.channel.send(textResponse);
  }

}