import { Dictionary } from "lodash";
import { ISkillData } from "./ISkillData";
import { ITalentData } from "./ITalentData";

export interface IHeroData {
    name: string;
    nameLower: string;
    role: string;
    type: string;
    skills: ISkillData[];
    talents: Map<string, ITalentData[]>;
}