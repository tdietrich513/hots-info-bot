import { RichEmbed, Message, GuildChannel } from "discord.js";
import { Command } from "discord-akairo";
import * as _ from "lodash";

import { getSkillData } from "../load-data";
import { SkillFormatter } from "../skill-formatter";
import { TalentFormatter } from "../talent-formatter";
import { ISkillData, ITalentData, IHeroData, ISkillsAndTalentsResult } from "../interfaces";


// @ts-ignore: TS2416
class SkillCommand extends Command {
    skills: ISkillData[];
    talents: ITalentData[];
    heroes: IHeroData[];
    heroNames: string[];

    constructor() {
        super("skill", {
            trigger: /\[\[[^\]]+?\]\]/ig
        });

        this.skills = [];
        this.talents = [];
        this.heroes = [];
        this.heroNames = [];

        getSkillData((hero: any) => {
            const heroSummary: IHeroData = {
                name: hero.name,
                nameLower: hero.name.toLowerCase(),
                role: hero.role,
                type: hero.type,
                talents: new Map<string, ITalentData[]>(),
                skills: []
            };

            this.heroNames.push(heroSummary.nameLower);

            hero.skills.forEach((skillSet: any) => {
                skillSet.forEach((skill: any) => {
                    let hotkey = skill.hotkey;
                    if (!hotkey || hotkey == undefined || hotkey == undefined) {
                        hotkey = skill.trait ? "Trait" : "Passive";
                    }
                    const skillSummary = {
                        nameLower: skill.name.toLowerCase(),
                        name: skill.name,
                        hero: hero.name,
                        hotkey: hotkey,
                        cooldown: skill.cooldown || "None",
                        manaCost: skill.manaCost || "None",
                        description: skill.description
                    };
                    heroSummary.skills.push(skillSummary);
                    this.skills.push(skillSummary);
                });
            });

            let tierNum: string;
            for (tierNum in hero.talents) {
                const tier = hero.talents[tierNum];
                const tierSummary: ITalentData[] = [];
                tier.forEach((talent: any) => {

                    const talentSummary: ITalentData = {
                        nameLower: talent.name.toLowerCase(),
                        name: talent.name,
                        hero: hero.name,
                        tier: tierNum,
                        description: talent.description
                    };
                    this.talents.push(talentSummary);
                    tierSummary.push(talentSummary);
                });
                heroSummary.talents.set(tierNum, tierSummary);
            }

            this.heroes.push(heroSummary);
            this.heroes.sort((a, b) => {
                if (a.nameLower < b.nameLower) return -1;
                if (a.nameLower > b.nameLower) return 1;
                return 0;
            });
        });
    }

    findSkillOrTalent(name: string): ISkillsAndTalentsResult {
        const matches: ISkillsAndTalentsResult = { skills: [], talents: [] };
        const nameLower = name.trim().toLowerCase();

        this.skills.forEach(skill => {
            if (skill.nameLower.includes(nameLower)) {
                matches.skills.push(skill);
            }
        });

        this.talents.forEach(talent => {
            if (talent.nameLower.includes(nameLower)) {
                matches.talents.push(talent);
            }
        });

        return matches;
    }

    findHeroTalentTier(heroName: string, tier: string): ITalentData[] {
        const heroNameLower = heroName.toLowerCase();
        const matchingHero = this.heroes.find(h => {
            const isExactMatch = h.nameLower == heroNameLower;

            const isWordMatch = h.nameLower
                .split(" ")
                .some(word => word.startsWith(heroNameLower));

            const isStartsWithMatch = h.nameLower.startsWith(heroNameLower);

            return (isExactMatch || isWordMatch || isStartsWithMatch);
        }
        );
        if (!matchingHero) return [];
        return matchingHero.talents.get(tier) || [];
    }

    isHeroTalentTierSearch(searchText: string): boolean {
        const pattern = /[\D]+\/[\d]{1,2}/i;
        return pattern.test(searchText);
    }

    isSkillOrTalentSearch(searchText: string): boolean {
        const pattern = /[\D]+/i;
        return pattern.test(searchText);
    }

    isJimmy(searchText: string): boolean {
        const pattern = /^jimmy$/i;
        return pattern.test(searchText);
    }

    isHeroSearch(searchText: string): boolean {
        return this.heroNames.some(hn => hn == searchText.toLowerCase());
    }

    outputHeroSkills(search: string, message: Message, useEmbeds: boolean) {
        const hero = this.heroes.find(h => h.nameLower == search.toLowerCase());
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
            });

            return message.channel.send(textResponse)
                .catch(console.error);
        }
    }

    outputHeroTalentTier(search: string, message: Message, useEmbeds: boolean) {
        const heroPattern = /[^\d\/]+/i;
        const tierPattern = /[\d]{1,2}/i;

        const heroSearch = search.match(heroPattern)[0].trim();
        const tierSearch = search.match(tierPattern)[0];

        if (heroSearch == "") {
            return message.reply(`Please provide a hero name to search for talents by tier.`);
        }

        const tier = this.findHeroTalentTier(heroSearch, tierSearch);
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

    outputSkillsOrTalents(search: string, message: Message, useEmbeds: boolean) {
        if (search.trim() == "") {
            return message.reply(`You're going to have to give me _something_ to look for.`);
        }

        const talentsAndSkills = this.findSkillOrTalent(search);
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

    public exec(message: Message): any {
        let skillMatches = message.cleanContent.match(/\[\[[^\]]+?\]\]/ig);
        skillMatches = _.chain(skillMatches)
            .map(m => m.replace(/(\[|\])/ig, "").replace(/\s/ig, " ").trim())
            .uniqBy(m => m)
            .value();
        if (skillMatches.length > 4) {
            message.reply(`I can only search for up to 4 things at once, don't be cheeky.`);
            skillMatches = skillMatches.slice(0, 4);
        }

        let useEmbeds = true;

        if (message.channel instanceof GuildChannel) {
            const me = message.client.user;
            const myPermissions = message.channel.permissionsFor(me);
            useEmbeds = myPermissions.has("EMBED_LINKS");
        }

        skillMatches.forEach(search => {
            if (this.isJimmy(search)) {
                return message.reply("This is Jimmy, now shut up.");
            }

            if (this.isHeroSearch(search)) {
                return this.outputHeroSkills(search, message, useEmbeds);
            }

            if (this.isHeroTalentTierSearch(search)) {
                return this.outputHeroTalentTier(search, message, useEmbeds);
            }

            if (this.isSkillOrTalentSearch(search)) {
                return this.outputSkillsOrTalents(search, message, useEmbeds);
            }

            return message.reply(`I have no idea what to do with '${search}', are you sure you know how to use me?`);
        });
    }
}

module.exports = SkillCommand;