import { HeroData } from "../hero-data";
import { Message, MessageEmbed, GuildChannel } from "discord.js";
import { SkillFormatter } from "../skill-formatter";
import { TalentFormatter } from "../talent-formatter";
import { ITalentData, ISkillsAndTalentsResult } from "../interfaces";
import * as _ from "lodash";

export function outputSkillsOrTalents(talentsAndSkills: ISkillsAndTalentsResult, search: string, message: Message, useEmbeds: boolean) {
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

    if (totalCount > 50) {
        if (message.channel instanceof GuildChannel) {
            message.reply(`I found a ${totalCount} matches for ${search}, sending directly to you so I don't spam the channel.`);
        }

        const shortVersions: string[] = [];
        talentsAndSkills.skills.forEach(skill => {
            shortVersions.push(SkillFormatter.shortText(skill, true));
        });
        undupedTalents.forEach((v, k) => {
            if (v.length == 1) shortVersions.push(TalentFormatter.shortText(v[0], true));
            else shortVersions.push(TalentFormatter.shortDupeText(v, false));
        });

        let textReply = "";
        shortVersions.forEach(desc => {
            if (textReply.length > 1500) {
                message.author.send(textReply);
                textReply = "";
            }
            textReply += desc + "\n";
        });

        return message.author.send(textReply);
    }

    if (totalCount > 10 && totalCount < 50) {
        const shortVersions: string[] = [];
        talentsAndSkills.skills.forEach(skill => {
            shortVersions.push(SkillFormatter.shortText(skill, true));
        });
        undupedTalents.forEach((v, k) => {
            if (v.length == 1) shortVersions.push(TalentFormatter.shortText(v[0], true));
            else shortVersions.push(TalentFormatter.shortDupeText(v, false));
        });
        return message.channel.send(`There are ${totalCount} matches for '${search}':\n${shortVersions.join(", ")}\nBe more specific for more detail.`);
    }

    if (totalCount > 4 && totalCount <= 10) {
        const shortVersions: string[] = [];
        talentsAndSkills.skills.forEach(skill => {
            shortVersions.push(SkillFormatter.shortText(skill, true));
        });
        undupedTalents.forEach((v, k) => {
            if (v.length == 1) shortVersions.push(TalentFormatter.shortText(v[0], true));
            else shortVersions.push(TalentFormatter.shortDupeText(v, true));
        });
        return message.channel.send(`There are ${totalCount} matches for '${search}':\n${shortVersions.join("\n")}\nBe more specific for more detail.`);
    }

    if (useEmbeds) {
        const embed = new MessageEmbed().setColor(0x00AE86);

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