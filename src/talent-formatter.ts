import { ITalentData } from "./interfaces";
import { MessageEmbed } from "discord.js";

export class TalentFormatter {
    static shortText(talent: ITalentData, includeHero: boolean): string {
        if (includeHero) {
            return `**${talent.name}** _${talent.hero} (Level ${talent.tier})_`;
        }

        return `**${talent.name}** _(Level ${talent.tier})_`;
    }

    static shortDupeText(talents: ITalentData[], multiLine: boolean): string {
        let output = `**${talents[0].name}**`;
        if (multiLine) {
            talents.forEach(t => {
                output += `\n\t${t.hero} (Level ${t.tier})`;
            });
        } else {
            const heroNames: string[] = [];
            talents.forEach(t => {
                heroNames.push(`${t.hero} (${t.tier})`);
            });
            output += ` Heroes: [_${heroNames.join(", ")}_]`;
        }

        return output;
    }

    static longText(talent: ITalentData, includeHero: boolean): string {
        let output = `**${talent.name}**`;
        if (includeHero) {
            output += ` (${talent.hero} Level ${talent.tier})`;
        } else {
            output += ` (${talent.tier})`;
        }
        output += `\n_${talent.description}_\n\n`;

        return output;
    }

    static longDupeText(talents: ITalentData[]): string {
        let output = `**${talents[0].name}**\n_${talents[0].description}_\n`;
        talents.forEach(t => {
            output += `\n\t${t.hero} (${t.tier})`;
        });
        output += "\n\n";
        return output;
    }

    static embed(embed: MessageEmbed, talent: ITalentData, includeHero: boolean): MessageEmbed {
        const talentDescription = `_${talent.description}_\n\n`;

        let talentTitle = `${talent.name}`;
        if (includeHero) talentTitle += ` (${talent.hero} ${talent.tier})`;
        else talentTitle += ` (${talent.tier})`;
        embed.addField(talentTitle, talentDescription);

        return embed;
    }

    static embedDupe(embed: MessageEmbed, talents: ITalentData[]): MessageEmbed {
        let talentDescription = `_${talents[0].description}_\n`;
        talents.forEach(t => {
            talentDescription += `${t.hero} (${t.tier})\n`;
        });

        const talentTitle = `${talents[0].name}`;
        embed.addField(talentTitle, talentDescription);

        return embed;
    }
}
