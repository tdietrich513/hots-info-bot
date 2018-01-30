const { AkairoClient } = require('discord-akairo');
const { getSkillData } = require('./src/load-data');
const fs = require('fs');

const client = new AkairoClient({
    ownerId: '',
    prefix: '##',
    allowMention: true,
    commandDirectory: './src/commands/',
    inhibitorDirectory: './src/inhibitors/',
    listenerDirectory: './src/listeners/'
});

fs.readFile('./secrets.json', 'utf-8', (err, content) => {
    if(err) {
        console.log('Make sure a secrets.json exists and contains the bot token!');
        console.error(err);
        return;
    }
    let secrets = JSON.parse(content);

    client.login(secrets.token).then(() => {
        console.log('Logged in!');
    });
});

