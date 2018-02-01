import HeroData from "../hero-data";
import { Message, RichEmbed } from "discord.js";
import { SkillFormatter } from "../skill-formatter";
import * as _ from "lodash";

export function outputHeroOverview(search: string, message: Message, useEmbeds: boolean) {
  const hero = HeroData.heroes.find(h => h.nameLower == search.toLowerCase());
  if (useEmbeds) {
      const embed = new RichEmbed().setColor(0x00AE86);
      embed.setTitle(`${hero.name} Skills Overview:`);
      embed.setDescription(`View popular builds at [HotsLogs.com](https://www.hotslogs.com/Sitewide/HeroDetails?Hero=${hero.name.replace(/\s/g, "%20")})`);
      hero.skills.forEach(skill => {
          SkillFormatter.embed(embed, skill, false);
      });

      return message.channel.send({ embed })
          .catch(console.error);
  } else {
      let textResponse = `**${hero.name} Skills Overview**:\n`;
      hero.skills.forEach(skill => {
          textResponse += SkillFormatter.longText(skill, false);
          if (textResponse.length > 1500) {
              message.channel.send(textResponse);
              textResponse = "";
          }
      });

      return message.channel.send(textResponse)
          .catch(console.error);
  }
}