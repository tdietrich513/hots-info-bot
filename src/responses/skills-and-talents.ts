import HeroData from "../hero-data";
import { Message, RichEmbed } from "discord.js";
import { SkillFormatter } from "../skill-formatter";
import { TalentFormatter } from "../talent-formatter";
import * as _ from "lodash";

export function outputSkillsOrTalents(search: string, message: Message, useEmbeds: boolean) {
  if (search.trim() == "") {
      return message.reply(`You're going to have to give me _something_ to look for.`);
  }

  const talentsAndSkills = HeroData.findSkillOrTalent(search);
  const totalCount = (talentsAndSkills.skills.length + talentsAndSkills.talents.length);
  if (totalCount == 0) {
      return message.reply(`Didn't find any skills or talents matching '${search}', sorry.`);
  }

  if (totalCount > 10) {
      return message.reply(`You're going to have to be way more specific, there are ${totalCount} matches for '${search}'.`);
  }

  if (totalCount > 4 && totalCount <= 10) {
      const shortVersions: string[] = [];
      talentsAndSkills.skills.forEach(skill => {
          shortVersions.push(SkillFormatter.shortText(skill, true));
      });

      talentsAndSkills.talents.forEach(talent => {
          shortVersions.push(TalentFormatter.shortText(talent, true));
      });
      return message.channel.send(`There are ${totalCount} matches for '${search}':\n${shortVersions.join("\n")}\nBe more specific for more detail.`);
  }

  const mentionedSkills: string[] = [];

  if (useEmbeds) {
      const embed = new RichEmbed().setColor(0x00AE86);

      talentsAndSkills.skills.forEach(skill => {
          mentionedSkills.push(skill.name);
          SkillFormatter.embed(embed, skill, true);
      });

      talentsAndSkills.talents.forEach(talent => {
          if (!_.includes(mentionedSkills, talent.name)) {
              TalentFormatter.embed(embed, talent, true);
              mentionedSkills.push(talent.name);
          }
      });

      return message.channel.send({ embed })
          .catch(console.error);
  } else {
      let textResponse = "";
      talentsAndSkills.skills.forEach(skill => {
          mentionedSkills.push(skill.name);
          textResponse += SkillFormatter.longText(skill, true);
      });

      talentsAndSkills.talents.forEach(talent => {
          if (!_.includes(mentionedSkills, talent.name)) {
              textResponse += TalentFormatter.longText(talent, true);
              mentionedSkills.push(talent.name);
          }
      });

      return message.channel.send(textResponse);
  }

}