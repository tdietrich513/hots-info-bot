import { ITalentData } from "./interfaces";
import { RichEmbed } from "discord.js";

export class TalentFormatter {
    static shortText(talent: ITalentData, includeHero: boolean): string {
        if (includeHero) {
            return `**${talent.name}** _${talent.hero} (Level ${talent.tier})_`;
        }

        return `**${talent.name}** _(${talent.tier})_`;
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

    static embed(embed: RichEmbed, talent: ITalentData, includeHero: boolean): RichEmbed {
        const talentDescription = `_${talent.description}_\n\n`;

        let talentTitle = `${talent.name}`;
        if (includeHero) talentTitle += ` (${talent.hero})`;
        embed.addField(talentTitle, talentDescription);

        return embed;
    }
}
