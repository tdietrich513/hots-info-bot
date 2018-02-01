import * as fs from "fs";
import { ISkillData, IHeroData, ITalentData, ISkillsAndTalentsResult } from "./interfaces";

export default class HeroData {
  static skills: ISkillData[] = [];
  static talents: ITalentData[] = [];
  static heroes: IHeroData[] = [];
  static heroNames: string[] = [];

  static loadData(): void {
    this.getSkillData(this.processHero).then(() => {
      console.info(`Import complete`);
      console.info(`Loaded ${HeroData.heroNames.length} heroes, ${HeroData.talents.length} talents, and ${HeroData.skills.length} skills.`);
    });
  }

  static findSkillOrTalent(name: string): ISkillsAndTalentsResult {
    const matches: ISkillsAndTalentsResult = { skills: [], talents: [] };
    const nameLower = name.trim().toLowerCase();

    this.skills.forEach(skill => {
      if (skill.nameLower.includes(nameLower)) {
        matches.skills.push(skill);
      }
    });

    this.talents.forEach(talent => {
      if (talent.nameLower.includes(nameLower)) {
        matches.talents.push(talent);
      }
    });

    return matches;
  }

  static findHeroTalentTier(heroName: string, tier: string): ITalentData[] {
    const heroNameLower = heroName.toLowerCase();
    const matchingHero = this.heroes.find(h => {
      const isExactMatch = h.nameLower == heroNameLower;

      const isWordMatch = h.nameLower
        .split(" ")
        .some(word => word.startsWith(heroNameLower));

      const isStartsWithMatch = h.nameLower.startsWith(heroNameLower);

      return (isExactMatch || isWordMatch || isStartsWithMatch);
    }
    );
    if (!matchingHero) return [];
    return matchingHero.talents.get(tier) || [];
  }

  private static readFiles(dirname: string, onFileContent: (f: string, c: string) => void, onError: (ex: any) => void): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      fs.readdir(dirname, (err, filenames) => {
        if (err) {
          onError(err);
          reject(err);
        }

        filenames.forEach(filename => {
          fs.readFile(dirname + filename, "utf-8", (err, content) => {
            if (err) {
              onError(err);
              reject(err);
            }
            onFileContent(filename, content);
          });
        });

        resolve(true);
      });
    });
  }

  private static getSkillData(onHero: (hd: any) => void): Promise<boolean> {
    const heroes = [];
    return this.readFiles("./hero-data/", (fileName, content) => {
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

  private static processHero(hero: any) {
    const heroSummary: IHeroData = {
      name: hero.name,
      nameLower: hero.name.toLowerCase(),
      role: hero.role,
      type: hero.type,
      talents: new Map<string, ITalentData[]>(),
      skills: []
    };

    HeroData.heroNames.push(heroSummary.nameLower);

    hero.skills.forEach((skillSet: any) => {
      skillSet.forEach((skill: any) => {
        let hotkey = skill.hotkey;
        if (!hotkey || hotkey == undefined || hotkey == undefined) {
          hotkey = skill.trait ? "Trait" : "Passive";
        }
        const skillSummary = {
          nameLower: skill.name.toLowerCase(),
          name: skill.name,
          hero: hero.name,
          hotkey: hotkey,
          cooldown: skill.cooldown || "None",
          manaCost: skill.manaCost || "None",
          description: skill.description
        };
        heroSummary.skills.push(skillSummary);
        HeroData.skills.push(skillSummary);
      });
    });

    let tierNum: string;
    for (tierNum in hero.talents) {
      const tier = hero.talents[tierNum];
      const tierSummary: ITalentData[] = [];
      tier.forEach((talent: any) => {

        const talentSummary: ITalentData = {
          nameLower: talent.name.toLowerCase(),
          name: talent.name,
          hero: hero.name,
          tier: tierNum,
          description: talent.description
        };
        HeroData.talents.push(talentSummary);
        tierSummary.push(talentSummary);
      });
      heroSummary.talents.set(tierNum, tierSummary);
    }

    HeroData.heroes.push(heroSummary);
    HeroData.heroes.sort((a, b) => {
      if (a.nameLower < b.nameLower) return -1;
      if (a.nameLower > b.nameLower) return 1;
      return 0;
    });
  }
}