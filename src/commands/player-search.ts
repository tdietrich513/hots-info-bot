import { RichEmbed, Message, GuildChannel } from "discord.js";
import { Command } from "discord-akairo";
import * as _ from "lodash";
import * as https from "https";

import canUseEmbeds from "../can-use-embeds";

class PlayerSearch extends Command {
    constructor() {
        super("player", {
            cooldown: 1000,
            ratelimit: 1
        });
        super.condition = this.testMessage;
    }

    pattern: RegExp = /\[\[(us|eu|kr|cn)\/(\w+)\#(\d{3,5})\]\]/i;
    regionMap = {
        "us": 1,
        "eu": 2,
        "kr": 3,
        "cn": 5
    };

    testMessage(message: Message): boolean {
        return this.pattern.test(message.cleanContent);
    }

    public exec(message: Message): any {
        const matches = message.cleanContent.match(this.pattern);

        const region = this.regionMap[matches[1].toLowerCase()];
        const name = matches[2];
        const tagNum = matches[3];
        const formattedPlayerName = `${region}/${name}_${tagNum}`;
        const requestUri = `https://api.hotslogs.com/Public/Players/${formattedPlayerName}`;
        console.log(requestUri);

        https.get(requestUri, (res => {
            res.setEncoding("utf8");
            let body = "";
            res.on("data", data => {
                body += data;
            });
            res.on("error", () => {
                return message.reply("There was an error getting stats from hotslogs, sorry.");
            });
            res.on("end", () => {
                console.log(body);
                if (!body || body === "null") {
                    return message.reply(`Couldn't find stats for ${matches[1]}/${name}#${tagNum} on hotslogs, sorry.`);
                }
                const result = JSON.parse(body);
                if (!result || !result.LeaderboardRankings) {
                    return message.reply("There was problem parsing the results from hotslogs, sorry.");
                }
                const qm = result.LeaderboardRankings.find(r => r.GameMode === "QuickMatch");
                const hl = result.LeaderboardRankings.find(r => r.GameMode === "HeroLeague");
                const ud = result.LeaderboardRankings.find(r => r.GameMode === "UnrankedDraft");
                const tl = result.LeaderboardRankings.find(r => r.GameMode === "TeamLeague");

                let response = `Current stats for ${name}:\n`;
                if (qm && qm.CurrentMMR) response += `\tQuick Match MMR: ${qm.CurrentMMR}\n`;
                if (hl && hl.CurrentMMR) response += `\tHero League MMR: ${hl.CurrentMMR}\n`;
                if (ud && ud.CurrentMMR) response += `\tUnranked Draft MMR: ${ud.CurrentMMR}\n`;
                if (tl && tl.CurrentMMR) response += `\tTeam League MMR: ${tl.CurrentMMR}\n`;
                response += "_(all data sourced from hotslogs public API)_";
                message.channel.send(response);
            });
        }));
    }
}

module.exports = PlayerSearch;