const fs = require('fs');

function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, (err, filenames) => {
        if (err) {
            onError(err);
            return;
        }

        filenames.forEach(filename => {
            fs.readFile(dirname + filename, 'utf-8', (err, content) => {
                if(err) {
                    onError(err);
                    return;
                }
                onFileContent(filename, content);
            });
        });
    });
}

function getSkillData(onHero) {
    let heroes = [];

    readFiles('./heroes-talents/hero/', (fileName, content) => {        
        let raw = JSON.parse(content);
        let processed = {
            name: raw.name,
            talents: raw.talents,
            skills: []            
        };
        for(let hero in raw.abilities) {
            processed.skills.push(raw.abilities[hero]);
        }

        onHero(processed);        
    },
    console.error);            
}

module.exports = { 
    readFiles: readFiles,
    getSkillData: getSkillData
}