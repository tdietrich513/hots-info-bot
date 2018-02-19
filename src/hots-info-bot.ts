import { AkairoClient, AkairoOptions } from "discord-akairo";
import * as fs from "fs";
import { Client, ClientOptions } from "discord.js";
import HeroData from "./hero-data";
import * as schedule from "node-schedule";

if (!process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_BOT_TOKEN === "") {
    console.error("Could not find the DISCORD_BOT_TOKEN environment variable!");
    process.exit(1);
}

const akairoOptions: AkairoOptions = {
    prefix: "##",
    allowMention: true,
    commandDirectory: __dirname + "/commands/",
    inhibitorDirectory: __dirname + "/inhibitors/",
    listenerDirectory: __dirname + "/listeners/"
};
const clientOptions: ClientOptions = {};
const client = new AkairoClient(akairoOptions, clientOptions);

console.log("Pulling Hero Data");
HeroData.loadData();
console.log("Pulling Win Rate Data");
HeroData.refreshWinRate();

const heroUpdateSchedule = new schedule.RecurrenceRule();
heroUpdateSchedule.hour = [6, 10, 14, 18];
heroUpdateSchedule.minute = 0;

const winRateUpdateSchedule = new schedule.RecurrenceRule();
winRateUpdateSchedule.hour = [0, 12];
winRateUpdateSchedule.minute = 0;

const winRateJob = schedule.scheduleJob("GetWinRates", winRateUpdateSchedule, () => {
    console.log("Refreshing Win Rate Data");
    HeroData.refreshWinRate();
});

const heroJob = schedule.scheduleJob("GetHeroData", heroUpdateSchedule, () => {
    console.log("Refreshing Hero Data");
    HeroData.loadData();
});

client.login(process.env.DISCORD_BOT_TOKEN).then(() => {
    console.log("Logged in!");
    if ( client instanceof Client ) {
        client.user.setPresence({ game: { name: "try ##help for help" }});
    }
});

