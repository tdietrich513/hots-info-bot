export interface IPatchNotesHero {
  expandedRole: string;
  id: string;
  shortName: string;
  attributeId: string;
  name: string;
  icon: string;
  role: string;
  type: string;
  releaseDate: string;
  abilities: Map<string, IPatchNotesAbility[]>;
  talents: Map<string, IPatchNotesTalent[]>;
}



export interface IPatchNotesAbility {
  name: string;
  description: string;
  hotkey: string;
  abilityId: string;
  cooldown: number;
  manaCost: string;
  trait: boolean;
}

export interface IPatchNotesTalentTree {
  1: IPatchNotesTalent[];
  4: IPatchNotesTalent[];
  7: IPatchNotesTalent[];
  10: IPatchNotesTalent[];
  13: IPatchNotesTalent[];
  16: IPatchNotesTalent[];
  20: IPatchNotesTalent[];
}

export interface IPatchNotesTalent {
  tooltipId: string;
  talentTreeId: string;
  name: string;
  description: string;
  icon: string;
  sort: number;
  abilityId: string;
}