import { AkairoClient, AkairoOptions, CommandHandler, ListenerHandler, InhibitorHandler, Command } from "discord-akairo";
import * as fs from "fs";
import { Client, ClientOptions } from "discord.js";
import { HeroData } from "./hero-data";
import * as schedule from "node-schedule";

if (!process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_BOT_TOKEN === "") {
    console.error("Could not find the DISCORD_BOT_TOKEN environment variable!");
    process.exit(1);
}


class HIBClient extends AkairoClient {
    commandHandler: CommandHandler;
    inhibitorHandler: InhibitorHandler;
    listenerHandler: ListenerHandler;

    constructor() {
        super({}, {});

        this.commandHandler = new CommandHandler(this, {
            directory: __dirname + "/commands/",
            prefix: "##"
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory:  __dirname + "/listeners/"
        });

        this.inhibitorHandler = new InhibitorHandler(this, {
            directory:  __dirname + "/inhibitors/"
        });

        this.commandHandler.loadAll();
        this.listenerHandler.loadAll();
        this.inhibitorHandler.loadAll();
    }
}

const client = new HIBClient();
const DEFAULT_STATUS = "try ##help for help";

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
    setStatus("Updating win rates");
    HeroData.refreshWinRate();
    setStatus(DEFAULT_STATUS);
});

const heroJob = schedule.scheduleJob("GetHeroData", heroUpdateSchedule, () => {
    console.log("Refreshing Hero Data");
    setStatus("Updating heroes data");
    HeroData.loadData();
    setStatus(DEFAULT_STATUS);
});

client.login(process.env.DISCORD_BOT_TOKEN).then(() => {
    console.log("Logged in!");
    setStatus(DEFAULT_STATUS);
});


function setStatus(status: string) {
    if ( client instanceof Client ) {
        client.user.setPresence({ activity: { name: status }});
    }
}
