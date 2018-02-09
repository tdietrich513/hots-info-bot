import { AkairoClient, AkairoOptions } from "discord-akairo";
import * as fs from "fs";
import { ClientOptions } from "discord.js";
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

const every4Hours = new schedule.RecurrenceRule();
every4Hours.hour = new schedule.Range(0, 23, 4);
every4Hours.minute = 0;

const winRateJob = schedule.scheduleJob("GetWinRates", every4Hours, () => {
    console.log("Refreshing Win Rate Data");
    HeroData.refreshWinRate();
});

const heroJob = schedule.scheduleJob("GetHeroData", every4Hours, () => {
    console.log("Refreshing Hero Data");
    HeroData.loadData();
});

client.login(process.env.DISCORD_BOT_TOKEN).then(() => {
    console.log("Logged in!");
});

