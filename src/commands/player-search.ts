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

    pattern: RegExp = /\[\[([a-z]{2})\/(\w+)\#(\d{3,5})\]\]/i;
    regionMap = {
        "us": 1,
        "am": 1,
        "na": 1,
        "eu": 2,
        "as": 3,
        "az": 3,
        "kr": 3,
        "cn": 5
    };

    leagueMap = {
        0: "Master",
        1: "Diamond",
        2: "Platinum",
        3: "Gold",
        4: "Silver",
        5: "Bronze"
    };

    testMessage(message: Message): boolean {
        return this.pattern.test(message.cleanContent);
    }

    public exec(message: Message): any {
        const [matches, rawRegion, name, tagNum] = message.cleanContent.match(this.pattern);
        const region = this.regionMap[rawRegion.toLowerCase()];

        if (!region || region == undefined) return message.reply(`I haven't heard of a '${matches[1]}' region, sorry.`);
        const formattedPlayerName = `${region}/${name}_${tagNum}`;
        const requestUri = `https://www.hotslogs.com/api/Players/${formattedPlayerName}`;

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
                if (!body || body === "null") {
                    return message.reply(`Couldn't find stats for ${rawRegion}/${name}#${tagNum} on hotslogs, sorry.`);
                }
                const result = JSON.parse(body);
                if (!result || !result.LeaderboardRankings) {
                    return message.reply("There was problem parsing the results from hotslogs, sorry.");
                }
                const playerId = result.PlayerID;
                const qm = result.LeaderboardRankings.find(r => r.GameMode === "QuickMatch");
                const hl = result.LeaderboardRankings.find(r => r.GameMode === "HeroLeague");
                const ud = result.LeaderboardRankings.find(r => r.GameMode === "UnrankedDraft");
                const tl = result.LeaderboardRankings.find(r => r.GameMode === "TeamLeague");
                const sl = result.LeaderboardRankings.find(r => r.GameMode === "StormLeague");

                if (!canUseEmbeds(message)) {
                    let response = `Current *HotsLogs MMR* for ${rawRegion}/${name}#${tagNum}:\n`;
                    if (qm && qm.CurrentMMR) response += `\tQuick Match: ${qm.CurrentMMR} ${qm.LeagueId ? "_(" + this.leagueMap[qm.LeagueID] + ")_" : "" }\n`;
                    if (hl && hl.CurrentMMR) response += `\tHero League: ${hl.CurrentMMR} ${hl.LeagueId ? "_(" + this.leagueMap[hl.LeagueID] + ")_" : "" }\n`;
                    if (ud && ud.CurrentMMR) response += `\tUnranked Draft: ${ud.CurrentMMR} ${ud.LeagueId ? "_(" + this.leagueMap[ud.LeagueID] + ")_" : "" }\n`;
                    if (tl && tl.CurrentMMR) response += `\tTeam League: ${tl.CurrentMMR} ${tl.LeagueId ? "_(" + this.leagueMap[tl.LeagueID] + ")_" : "" }\n`;
                    if (sl && sl.CurrentMMR) response += `\tStorm League: ${sl.CurrentMMR} ${sl.LeagueId ? "_(" + this.leagueMap[sl.LeagueID] + ")_" : "" }\n`;
                    message.channel.send(response)
                        .catch(console.error);
                } else {
                    const embed = new RichEmbed().setColor(0x00AE86);
                    embed.setTitle(`Current MMR for ${matches[1]}/${name}#${tagNum}:`);
                    embed.setDescription(`Sourced from [Hotslogs.com](https://www.hotslogs.com/Player/Profile?PlayerId=${playerId})`);
                    if (qm && qm.CurrentMMR) embed.addField("Quick Match", `${qm.CurrentMMR} ${qm.LeagueId ? "_(" + this.leagueMap[qm.LeagueID] + ")_" : "" }`);
                    if (hl && hl.CurrentMMR) embed.addField("Hero League", `${hl.CurrentMMR} ${hl.LeagueId ? "_(" + this.leagueMap[hl.LeagueID] + ")_" : "" }`);
                    if (ud && ud.CurrentMMR) embed.addField("Unranked Draft", `${ud.CurrentMMR} ${ud.LeagueId ? "_(" + this.leagueMap[ud.LeagueID] + ")_" : "" }`);
                    if (tl && tl.CurrentMMR) embed.addField("Team League", `${tl.CurrentMMR} ${tl.LeagueId ? "_(" + this.leagueMap[tl.LeagueID] + ")_" : "" }`);
                    if (sl && sl.CurrentMMR) embed.addField("Storm League", `${sl.CurrentMMR} ${sl.LeagueId ? "_(" + this.leagueMap[sl.LeagueID] + ")_" : "" }`);
                    message.channel.send({ embed })
                        .catch(console.error);
                }

            });
        }));
    }
}

module.exports = PlayerSearch;
