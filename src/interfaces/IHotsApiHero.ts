export interface IHotsApiHero {
  name: string;
  shortName: string;
  attribute_id: string;
  translations: string[];
  role: string;
  type: string;
  releaseDate: string;
  abilities: IHotsApiAbility[];
  talents: IHotsApiTalent[];
}

export interface IHotsApiAbility {
  owner: string;
  name: string;
  title: string;
  description: string;
  hotkey: string;
  cooldown: number;
  mana_cost: number;
  trait: boolean;
}

export interface IHotsApiTalent {
  name: string;
  title: string;
  description: string;
  ability: string;
  sort: number;
  cooldown: number;
  mana_cost: number;
  level: number;
}