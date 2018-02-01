import * as fs from "fs";

export function readFiles(dirname: string, onFileContent: (f: string, c: string) => void, onError: (ex: any) => void) {
    fs.readdir(dirname, (err, filenames) => {
        if (err) {
            onError(err);
            return;
        }

        filenames.forEach(filename => {
            fs.readFile(dirname + filename, "utf-8", (err, content) => {
                if (err) {
                    onError(err);
                    return;
                }
                onFileContent(filename, content);
            });
        });
    });
}

export function getSkillData(onHero: (hd: any) => void) {
    const heroes = [];

    readFiles("./hero-data/", (fileName, content) => {
        const raw = JSON.parse(content);
        const processed = {
            name: raw.name,
            talents: raw.talents,
            skills: new Array()
        };
        for (const hero in raw.abilities) {
            processed.skills.push(raw.abilities[hero]);
        }

        onHero(processed);
    },
        console.error);
}
