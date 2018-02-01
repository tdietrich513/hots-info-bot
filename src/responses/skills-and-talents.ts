import HeroData from "../hero-data";
import { Message, RichEmbed } from "discord.js";
import { SkillFormatter } from "../skill-formatter";
import { TalentFormatter } from "../talent-formatter";
import { ITalentData } from "../interfaces";
import * as _ from "lodash";

export function outputSkillsOrTalents(search: string, message: Message, useEmbeds: boolean) {
    if (search.trim() == "") {
        return message.reply(`You're going to have to give me _something_ to look for.`);
    }

    const talentsAndSkills = HeroData.findSkillOrTalent(search);

    const undupedTalents: Map<string, ITalentData[]> = new Map<string, ITalentData[]>();
    talentsAndSkills.talents.forEach(t => {
        if (!talentsAndSkills.skills.some(s => s.name == t.name)) {
            if (undupedTalents.has(t.name)) undupedTalents.get(t.name).push(t);
            else (undupedTalents.set(t.name, [t]));
        }
    });

    const totalCount = (talentsAndSkills.skills.length + undupedTalents.size);
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
        undupedTalents.forEach((v, k) => {
            if (v.length == 1) shortVersions.push(TalentFormatter.shortText(v[0], true));
            else shortVersions.push(TalentFormatter.shortDupeText(v));
        });
        return message.channel.send(`There are ${totalCount} matches for '${search}':\n${shortVersions.join("\n")}\nBe more specific for more detail.`);
    }

    if (useEmbeds) {
        const embed = new RichEmbed().setColor(0x00AE86);

        talentsAndSkills.skills.forEach(skill => {
            SkillFormatter.embed(embed, skill, true);
        });
        undupedTalents.forEach((v, k) => {
            if (v.length == 1) TalentFormatter.embed(embed, v[0], true);
            else TalentFormatter.embedDupe(embed, v);
        });

        return message.channel.send({ embed })
            .catch(console.error);
    } else {
        let textResponse = "";
        talentsAndSkills.skills.forEach(skill => {
            textResponse += SkillFormatter.longText(skill, true);
        });

        undupedTalents.forEach((v, k) => {
            if (v.length == 1) textResponse += TalentFormatter.longText(v[0], true);
            else textResponse += TalentFormatter.longDupeText(v);
        });

        return message.channel.send(textResponse);
    }

}