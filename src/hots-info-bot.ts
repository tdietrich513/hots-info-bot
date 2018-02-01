import { AkairoClient, AkairoOptions } from "discord-akairo";
import * as fs from "fs";
import { ClientOptions } from "discord.js";
import HeroData from "./hero-data";

const akairoOptions: AkairoOptions = {
    prefix: "##",
    allowMention: true,
    commandDirectory: "./commands/"
};
const clientOptions: ClientOptions = {};
const client = new AkairoClient(akairoOptions, clientOptions);

console.log("Loading data...");
HeroData.loadData();

fs.readFile("../secrets.json", "utf-8", (err, content) => {
    if (err) {
        console.log("Make sure a secrets.json exists and contains the bot token!");
        console.error(err);
        return;
    }
    const secrets = JSON.parse(content);

    client.login(secrets.token).then(() => {
        console.log("Logged in!");
    });
});

