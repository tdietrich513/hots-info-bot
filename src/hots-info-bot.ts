import { AkairoClient, AkairoOptions } from "discord-akairo";
import { getSkillData } from "./load-data";
import * as fs from "fs";
import { ClientOptions } from "discord.js";

const akairoOptions: AkairoOptions = {
    prefix: "##",
    allowMention: true,
    commandDirectory: "./commands/"
};
const clientOptions: ClientOptions = {};
const client = new AkairoClient(akairoOptions, clientOptions);

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

