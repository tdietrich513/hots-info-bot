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

        getSkillData(hero => {
            hero.skills.forEach(skillSet => {
                skillSet.forEach(skill => {                    
                    this.skills.push({
                        nameLower: skill.name.toLowerCase(),
                        name: skill.name,
                        hero: hero.name,
                        hotkey: skill.hotkey,
                        cooldown: skill.cooldown,
                        manaCost: skill.manaCost || 'None',
                        description: skill.description
                    });                             
                });
            });

            for(let tiernum in hero.talents) {                
                let tier = hero.talents[tiernum];
                tier.forEach(talent => {
                    this.talents.push({
                        nameLower: talent.name.toLowerCase(),
                        name: talent.name,
                        hero: hero.name,
                        tier: tiernum,
                        description: talent.description
                    });
                });
            }                   
        });
    }
   
    findSkillOrTalent(name) {
        let matches = { skills: [], talents: [] };
        let nameLower = name.toLowerCase();

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

    exec(message, match, groups) {
        let skillMatches = message.cleanContent.match(/\[\[[^\]]+?\]\]/ig)

        skillMatches.forEach(match => {
            let name = match.replace(/(\[|\])/ig,'');

            if (name.toLowerCase() == "jimmy") {
                return message.reply("This is Jimmy, now shut up.");
            }

            let talentsAndSkills = this.findSkillOrTalent(name);
            let totalCount = (talentsAndSkills.skills.length + talentsAndSkills.talents.length);
            if (totalCount == 0) {                
                message.reply(`Didn't find anything matching ${name}, sorry.`);                
            } else if (totalCount > 10) {                 
                message.reply(`You're going to have to be way more specific, there are ${totalCount} matches for '${name}'.`);
            } else if (totalCount > 4 && totalCount <= 10) {                
                let shortVersions = [];                
                talentsAndSkills.skills.forEach(skill => {
                    shortVersions.push(`**${skill.name}** _${skill.hero} (${skill.hotkey})_`);                    
                });

                talentsAndSkills.talents.forEach(talent => {
                    shortVersions.push(`**${talent.name}** _${talent.hero} (Level ${talent.tier})_`);                    
                });
                message.channel.send(`There are ${totalCount} matches for '${name}':\n${shortVersions.join('\n')}\nBe more specific for more detail.`);
            } else {
                let embed = new RichEmbed()                    
                    .setColor(0x00AE86);        
                
                talentsAndSkills.skills.forEach(skill => {
                    let skillDescription = `**Hotkey**: ${skill.hotkey}\t\t**Cooldown**: ${skill.cooldown}\t\t**Cost**: ${skill.manaCost}\n\n_${skill.description}_\n\n`
                    embed.addField(`${skill.name} (${skill.hero})`, skillDescription);
                })

                talentsAndSkills.talents.forEach(talent => {
                    let talentDescription = `\n_${talent.description}_\n\n`
                    embed.addField(`${talent.name} (${talent.hero} level ${talent.tier})`, talentDescription);
                })

                message.channel.send({embed});
            }
        });                
    }
}

module.exports = SkillCommand;