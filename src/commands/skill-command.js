const { RichEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const { getSkillData } = require('../load-data');

class SkillCommand extends Command {    
    

    constructor() {        
        super('skill', {
            trigger: /\[\[[^\]]+?\]\]/ig            
        });        

        this.skills = [];
        this.talents = [];
        this.heroes = [];

        getSkillData(hero => {
            let heroSummary = {
                name: hero.name,
                nameLower: hero.name.toLowerCase(),
                role: hero.role,
                type: hero.type,
                talents: {}
            }

            hero.skills.forEach(skillSet => {
                skillSet.forEach(skill => {                    
                    this.skills.push({
                        nameLower: skill.name.toLowerCase(),
                        name: skill.name,
                        hero: hero.name,
                        hotkey: skill.hotkey || skill.trait ? 'Trait' : 'Passive',
                        cooldown: skill.cooldown || 'None',
                        manaCost: skill.manaCost || 'None',
                        description: skill.description
                    });                             
                });
            });

            for(let tiernum in hero.talents) {                
                let tier = hero.talents[tiernum];
                heroSummary.talents[tiernum] = []
                let tierSummary = [];
                tier.forEach(talent => {
                    
                    let talentSummary = {
                        nameLower: talent.name.toLowerCase(),
                        name: talent.name,
                        hero: hero.name,                        
                        tier: tiernum,
                        description: talent.description
                    }
                    this.talents.push(talentSummary);
                    heroSummary.talents[tiernum].push(talentSummary);
                });
            }

            this.heroes.push(heroSummary);
        });
    }
   
    findSkillOrTalent(name) {
        let matches = { skills: [], talents: [] };
        let nameLower = name.trim().toLowerCase();

        this.skills.forEach(skill => {
            if (skill.nameLower.includes(nameLower)) {
                matches.skills.push(skill);
            }
        });

        this.talents.forEach(talent => {
            if (talent.nameLower.includes(nameLower)){
                matches.talents.push(talent)
            }
        });

        return matches;
    }

    findHeroTalentTier(heroName, tier) {
        let matchingHero = this.heroes.find(h => h.nameLower
            .split(' ')
            .some(word => word.startsWith(heroName.toLowerCase()))
        );
        if (!matchingHero) return [];
        return matchingHero.talents[tier] || [];
    }

    isHeroTalentTierSearch(searchText) {
        const pattern = /[\D]+[\d]{1,2}/i;
        return pattern.test(searchText);
    }

    isSkillOrTalentSearch(searchText) {
        const pattern = /[\D]+/i;
        return pattern.test(searchText);
    }

    isJimmy(searchText){
        const pattern = /^jimmy$/i;
        return pattern.test(searchText);
    }

    outputHeroTalentTier(search, message) {
        const heroPattern = /[\D]+/i;
        const tierPattern = /[\d]{1,2}/i;

        let heroSearch = search.match(heroPattern)[0].trim();
        let tierSearch = search.match(tierPattern)[0];

        let tier = this.findHeroTalentTier(heroSearch, tierSearch);
        if (tier.length === 0) {
            return message.reply(`Couldn't find a hero talent tier for '${search}'`);
        }

        let embed = new RichEmbed() 
            .setColor(0x00AE86)
            .setTitle(`${tier[0].hero}'s Level ${tier[0].tier} Talents:`);
        
        tier.forEach(talent => {
            let talentDescription = `\n_${talent.description}_\n\n`
            embed.addField(`${talent.name}`, talentDescription);
        });

        message.channel.send({embed});
    }

    outputSkillsOrTalents(search, message) {
        let talentsAndSkills = this.findSkillOrTalent(search);
        let totalCount = (talentsAndSkills.skills.length + talentsAndSkills.talents.length);
        if (totalCount == 0) {                
            message.reply(`Didn't find any skills or talents matching '${search}', sorry.`);                
        } else if (totalCount > 10) {                 
            message.reply(`You're going to have to be way more specific, there are ${totalCount} matches for '${search}'.`);
        } else if (totalCount > 4 && totalCount <= 10) {                
            let shortVersions = [];                
            talentsAndSkills.skills.forEach(skill => {
                shortVersions.push(`**${skill.name}** _${skill.hero} (${skill.hotkey})_`);                    
            });

            talentsAndSkills.talents.forEach(talent => {
                shortVersions.push(`**${talent.name}** _${talent.hero} (Level ${talent.tier})_`);                    
            });
            message.channel.send(`There are ${totalCount} matches for '${search}':\n${shortVersions.join('\n')}\nBe more specific for more detail.`);
        } else {
            let embed = new RichEmbed()                    
                .setColor(0x00AE86);        
            
            talentsAndSkills.skills.forEach(skill => {
                let skillDescription = `**Hotkey**: ${skill.hotkey}\t\t**Cooldown**: ${skill.cooldown}\t\t**Cost**: ${skill.manaCost}\n\n_${skill.description}_\n\n`
                embed.addField(`${skill.name} (${skill.hero})`, skillDescription);
            });

            talentsAndSkills.talents.forEach(talent => {
                let talentDescription = `\n_${talent.description}_\n\n`
                embed.addField(`${talent.name} (${talent.hero} level ${talent.tier})`, talentDescription);
            });

            message.channel.send({embed});
        }
    }

    exec(message, match, groups) {
        let skillMatches = message.cleanContent.match(/\[\[[^\]]+?\]\]/ig)

        skillMatches.forEach(match => {
            let search = match.replace(/(\[|\])/ig,'');

            if (this.isJimmy(search)) {
                return message.reply("This is Jimmy, now shut up.");
            }

            if (this.isHeroTalentTierSearch(search)){
                return this.outputHeroTalentTier(search, message);
            }

            if (this.isSkillOrTalentSearch(search)){
                return this.outputSkillsOrTalents(search, message);
            }

            return message.reply(`I have no idea what to do with '${search}', are you sure you know how to use me?`);
        });
    }
}

module.exports = SkillCommand;