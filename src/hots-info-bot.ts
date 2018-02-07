import { AkairoClient, AkairoOptions } from "discord-akairo";
import * as fs from "fs";
import { ClientOptions } from "discord.js";
import HeroData from "./hero-data";
import * as schedule from "node-schedule";

if (!process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_BOT_TOKEN === "") {
    console.error("Could not find the DISCORD_BOT_TOKEN environment variable!");
    process.exit(1);
}

if (!process.env.DATA_PATH || process.env.DATA_PATH === "") {
    console.error("Could not find the DATA_PATH environment variable!");
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

console.log("Loading data...");
HeroData.loadData();
console.log("Pulling Win Rate Data");
HeroData.refreshWinRate();

const refreshJob = schedule.scheduleJob("0 0/4 * * * ", () => {
    console.log("Refreshing Win Rate Data");
    HeroData.refreshWinRate();
});

client.login(process.env.DISCORD_BOT_TOKEN).then(() => {
    console.log("Logged in!");
});

