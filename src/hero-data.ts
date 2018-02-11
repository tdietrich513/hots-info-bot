import * as fs from "fs";
import { ISkillData, IHeroData, ITalentData, ISkillsAndTalentsResult, IWinRate, IHotsApiHero, IHotsApiAbility, IHotsApiTalent } from "./interfaces";
import { getWinRates } from "./get-winrates";

import fetch from "node-fetch";

export default class HeroData {
  static skills: ISkillData[] = [];
  static talents: ITalentData[] = [];
  static heroes: IHeroData[] = [];
  static heroNames: string[] = [];
  static winrates: IWinRate[] = [];

  static loadData(): void {
    this.getSkillData(this.processHero).then(() => {
      console.info(`Heroes updating`);
    });
  }

  static refreshWinRate(): void {
    getWinRates(data => {
      this.winrates = data;
      console.info("Win Rates updated");
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

  static descriptionSearch(effect: string): ISkillsAndTalentsResult {
    const matches: ISkillsAndTalentsResult = { skills: [], talents: [] };
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

  private static getSkillData(onHero: (hd: IHotsApiHero) => void): Promise<void> {
    const endpoint = "http://hotsapi.net/api/v1/heroes";
    return fetch(endpoint).then(response => {
      response.json().then((json: IHotsApiHero[]) => {
        json.forEach(onHero);
      }, console.error);
    }, console.error);
  }

  private static processHero(hero: IHotsApiHero) {
    if (hero.name == "Lúcio") hero.name = "Lucio";

    const heroSummary: IHeroData = {
      name: hero.name,
      nameLower: hero.name.toLowerCase(),
      role: hero.role,
      type: hero.type,
      talents: new Map<string, ITalentData[]>(),
      skills: []
    };

    if (!HeroData.heroNames.some(n => n == heroSummary.nameLower)) HeroData.heroNames.push(heroSummary.nameLower);

    hero.abilities.forEach((skill: IHotsApiAbility) => {
      const stateName = skill.owner.replace(hero.name, "");
      let hotkey = skill.hotkey;
      if (!hotkey && skill.trait) hotkey = "Trait";

      const skillSummary: ISkillData = {
        nameLower: skill.title.toLowerCase(),
        name: skill.title,
        hero: hero.name,
        hotkey: hotkey,
        cooldown: skill.cooldown,
        manaCost: skill.mana_cost,
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

    hero.talents.forEach(talent => {
      const talentSummary: ITalentData = {
        nameLower: talent.title.toLowerCase(),
        name: talent.title,
        hero: hero.name,
        tier: talent.level.toString(),
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
}