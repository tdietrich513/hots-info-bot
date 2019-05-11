import HeroData from "./hero-data";
import * as _ from "lodash";


export class HeroRoles {
  static roles: string[]

  public getHeroesByRole(role: string): string[] {
    let roleLower = role.toLowerCase()
    
    if (roleLower == "melee" || roleLower == "ranged") {
      roleLower = roleLower + " assassin";
    }

    const roleHeroes = _.chain(HeroData.heroes)
      .filter(hd => hd.role.toLowerCase() == roleLower)
      .map(hd => hd.name.toLowerCase())
      .value();
  }

  public getRoles(): string[] {
    if (HeroRoles.roles == []) {
      HeroRoles.roles = HeroData.heroes.map(h => h.role);
    }

    return HeroRoles.roles;
  }
} 