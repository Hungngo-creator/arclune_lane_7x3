import { z } from 'zod';

import { ROSTER } from '../catalog.ts';
import rawSkillSetsConfig from './skills.config.ts';

import type { UnknownRecord } from '@types/common';
import type { UnitId } from '@types/units';
import type { SkillEntry, SkillSection } from '@types/config';

function deepFreeze<T>(value: T): T{
  if (Array.isArray(value)){
    value.forEach(deepFreeze);
    return Object.freeze(value);
  }
  if (value && typeof value === 'object'){
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  }
  return value;
}

function normalizeSection(section: SkillSection | string | null | undefined): SkillSection | null{
  if (!section) return null;
  if (typeof section === 'string'){
    return { name: '', description: section } as SkillSection;
  }
  const normalized: SkillSection = { ...section };
  if (Array.isArray(section.tags)){
    normalized.tags = [...section.tags];
  }
  if (Array.isArray(section.notes)){
    normalized.notes = [...section.notes];
  } else if (typeof section.notes === 'string'){
    const note = section.notes;
    normalized.notes = [note];
  }
  return normalized;
}

function normalizeSkillEntry(entry: SkillSection | null | undefined): SkillSection | null{
  if (!entry) return null;
  const normalized: SkillSection = { ...entry };
  if (Array.isArray(entry.tags)){
    normalized.tags = [...entry.tags];
  }
  if (entry.cost && typeof entry.cost === 'object'){
    normalized.cost = { ...entry.cost };
  }
  if (Array.isArray(entry.notes)){
    normalized.notes = [...entry.notes];
  }
  if (entry.notes && !Array.isArray(entry.notes)){
    const note = entry.notes as string;
    normalized.notes = [note];
  }
  return normalized;
}

type RawSkillSet = Readonly<
  {
    unitId: UnitId;
    basic?: SkillSection | string | null;
    skill?: SkillSection | null;
    skills?: ReadonlyArray<SkillSection>;
    ult?: SkillSection | string | null;
    talent?: SkillSection | string | null;
    technique?: SkillSection | string | null;
    notes?: ReadonlyArray<string> | string | null;
  } &
    UnknownRecord
>;

const RawSkillSetSchema = z.object({
  unitId: z.string()
});
const RawSkillSetListSchema = z.array(RawSkillSetSchema);
const rawSkillSets = RawSkillSetListSchema.parse(rawSkillSetsConfig) as ReadonlyArray<RawSkillSet>;

const SKILL_KEYS = ['basic', 'skill', 'skills', 'ult', 'talent', 'technique', 'notes'] as const satisfies ReadonlyArray<keyof SkillEntry | 'skill'>;

const skillSets: Readonly<Record<UnitId, SkillEntry>> = rawSkillSets.reduce<Record<UnitId, SkillEntry>>((acc, entry) => {
  const skills = Array.isArray(entry.skills)
    ? entry.skills.map(normalizeSkillEntry).filter(isSkillSection)
    : [];
  const skill = entry.skill ? normalizeSkillEntry(entry.skill) : (skills[0] ?? null);
  const normalized: SkillEntry = {
    unitId: entry.unitId,
    basic: normalizeSection(entry.basic),
    skill,
    skills,
    ult: normalizeSection(entry.ult),
    talent: normalizeSection(entry.talent),
    technique: normalizeSection(entry.technique),
    notes: Array.isArray(entry.notes) ? [...entry.notes] : (entry.notes ? [entry.notes] : [])
  };
  deepFreeze(normalized);
  acc[entry.unitId] = normalized;
  return acc;
}, {});

deepFreeze(skillSets);

export { skillSets };

function isSkillEntry(entry: SkillEntry | null | undefined): entry is SkillEntry{
  return Boolean(entry);
}

function isSkillSection(entry: SkillSection | null | undefined): entry is SkillSection{
  return Boolean(entry);
}

export function getSkillSet(unitId: UnitId | null | undefined): SkillEntry | null{
  if (!unitId) return null;
  return skillSets[unitId] ?? null;
}

export function listSkillSets(): SkillEntry[]{
  return ROSTER
    .map(unit => skillSets[unit.id])
    .filter(isSkillEntry);
}

export function hasSkillSet(unitId: UnitId | null | undefined): boolean{
  return unitId != null && Object.prototype.hasOwnProperty.call(skillSets, unitId);
}

export function validateSkillSetStructure(entry: unknown): boolean{
  if (!entry || typeof entry !== 'object') return false;
  const record = entry as Record<string, unknown>;
  for (const key of SKILL_KEYS){
    if (!(key in entry)){
      return false;
    }
  }
  if (!('unitId' in record) || !record.unitId) return false;
  if ('skills' in record){
    const skillsValue = record.skills;
    if (skillsValue && !Array.isArray(skillsValue)) return false;
  }
  return true;
}
