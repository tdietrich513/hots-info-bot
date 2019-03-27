import * as fs from "fs";
import {
  ISkillData,
  IHeroData,
  ITalentData,
  ISkillsAndTalentsResult,
  IWinRate,
  IHotsApiHero,
  IHotsApiAbility,
  IHotsApiTalent
} from "./interfaces";
import {
  getWinRates
} from "./get-winrates";

import fetch from "node-fetch";
import {
  IPatchNotesHero,
  IPatchNotesAbility
} from "./interfaces/IPatchNotesHero";

export default class HeroData {
  static skills: ISkillData[] = [];
  static talents: ITalentData[] = [];
  static heroes: IHeroData[] = [];
  static heroNames: string[] = [];
  static winrates: IWinRate[] = [];
  static totalGames: number = 0;

  static loadData(): void {
    this.getSkillData(this.processHero).then(() => {
      console.info(`Heroes updating`);
    });
  }

  static refreshWinRate(): void {
    getWinRates(data => {
      this.winrates = data;
      if (data.length > 0) {
        const gamesPickedAndBanned = data[0].games + data[0].banCount;
        this.totalGames = gamesPickedAndBanned / (data[0].popRate / 100);
      }
      console.info("Win Rates updated");
    });
  }

  static findSkillOrTalent(name: string): ISkillsAndTalentsResult {
    const matches: ISkillsAndTalentsResult = {
      skills: [],
      talents: []
    };
    const nameLower = HeroData.makeSearchableName(name);

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

  static descriptionSearch(effect: string): ISkillsAndTalentsResult {
    const matches: ISkillsAndTalentsResult = {
      skills: [],
      talents: []
    };
    const pattern = new RegExp(effect, "ig");

    this.skills.forEach(skill => {
      if (pattern.test(skill.description)) {
        matches.skills.push(skill);
      }
    });

    this.talents.forEach(talent => {
      if (pattern.test(talent.description)) {
        matches.talents.push(talent);
      }
    });

    return matches;
  }

  static findHeroTalentTier(heroName: string, tier: string): ITalentData[] {
    const heroNameLower = HeroData.makeSearchableName(heroName);
    const matchingHero = this.heroes.find(h => {
      const isExactMatch = h.nameLower == heroNameLower;

      const isWordMatch = h.nameLower
        .split(" ")
        .some(word => word.startsWith(heroNameLower));

      const isStartsWithMatch = h.nameLower.startsWith(heroNameLower);

      return (isExactMatch || isWordMatch || isStartsWithMatch);
    });
    if (!matchingHero) return [];
    return matchingHero.talents.get(tier) || [];
  }

  private static readFiles(dirname: string, onFileContent: (f: string, c: string) => void, onError: (ex: any) => void): Promise < boolean > {
    return new Promise < boolean > ((resolve, reject) => {
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

  private static getSkillData(onHero: (hd: IHotsApiHero) => void): Promise < void > {
    const endpoint = "http://hotsapi.net/api/v1/heroes";
    return fetch(endpoint).then(response => {
      response.json().then((json: IHotsApiHero[]) => {
        json.forEach(onHero);
      }, console.error);
    }, console.error);
  }

  static makeSearchableName(name: string): string {
    const badChars = /[^a-z0-9]/ig;
    return name.replace(badChars, "").toLowerCase();
  }

  private static processHero(apiHero: IHotsApiHero) {
    if (apiHero.name == "Lúcio") apiHero.name = "Lucio";
    if (apiHero.name == "Varian") apiHero.role = "Warrior";

    const heroSummary: IHeroData = {
      name: apiHero.name,
      nameLower: HeroData.makeSearchableName(apiHero.name),
      role: apiHero.role,
      type: apiHero.type,
      talents: new Map < string,
      ITalentData[] > (),
      skills: []
    };
    if (!HeroData.heroNames.some(n => n == heroSummary.nameLower)) HeroData.heroNames.push(heroSummary.nameLower);

    const heroTalentDataRepo = "https://github.com/heroespatchnotes/heroes-talents/raw/master/hero/";
    let fileName = `${apiHero.name.toLowerCase().replace(/[\.\-\'\s]/g, "")}.json`;
    if (apiHero.name == "The Lost Vikings") fileName = "lostvikings.json";

    fetch(`${heroTalentDataRepo}${fileName}`).then(response => {
      response.json().then((hero: IPatchNotesHero) => {

        for (const stance in hero.abilities) {
          hero.abilities[stance].forEach(skill => {
            const stateName = stance.replace(hero.name, "");
            let hotkey = skill.hotkey;
            if (!hotkey && skill.trait) hotkey = "Trait";

            const skillSummary: ISkillData = {
              nameLower: HeroData.makeSearchableName(skill.name),
              name: skill.name,
              hero: hero.name,
              hotkey: hotkey,
              cooldown: skill.cooldown,
              manaCost: +skill.manaCost,
              description: skill.description,
              state: stateName
            };
            heroSummary.skills.push(skillSummary);
            const existingSkillIndex = HeroData.skills.findIndex(s => s.name == skillSummary.name && s.hero == skillSummary.hero);
            if (existingSkillIndex >= 0) {
              HeroData.skills[existingSkillIndex] = skillSummary;
            } else {
              HeroData.skills.push(skillSummary);
            }
          });
        }

        for (const tier in hero.talents) {
          hero.talents[tier].forEach(talent => {
            const talentSummary: ITalentData = {
              nameLower: HeroData.makeSearchableName(talent.name),
              name: talent.name,
              hero: hero.name,
              tier: tier.toString(),
              description: talent.description
            };

            if (!heroSummary.talents.has(talentSummary.tier)) {
              heroSummary.talents.set(talentSummary.tier, [talentSummary]);
            } else {
              heroSummary.talents.get(talentSummary.tier).push(talentSummary);
            }

            const existingTalentIndex = HeroData.talents.findIndex(t => t.name == talentSummary.name && t.hero == talentSummary.hero);
            if (existingTalentIndex >= 0) {
              HeroData.talents[existingTalentIndex] = talentSummary;
            } else {
              HeroData.talents.push(talentSummary);
            }
          });

          const existingHeroIndex = HeroData.heroes.findIndex(h => h.name == heroSummary.name);
          if (existingHeroIndex >= 0) {
            HeroData.heroes[existingHeroIndex] = heroSummary;
          } else {
            HeroData.heroes.push(heroSummary);
            HeroData.heroes.sort((a, b) => {
              if (a.nameLower < b.nameLower) return -1;
              if (a.nameLower > b.nameLower) return 1;
              return 0;
            });
          }
        }
      });
    });
  }
}
