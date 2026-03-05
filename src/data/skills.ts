//home (termux)/arclune_lane_7x3/src/data/skills.ts

import { z } from 'zod';

import { ROSTER } from '../catalog.ts';
import rawSkillSetsConfig from './skills.config.ts';
import { getTagDefinition, listUnknownTags, normalizeTagList } from './tags.ts';

import type { UnknownRecord } from '@shared-types/common';
import type { UnitId } from '@shared-types/units';
import type { SkillEntry, SkillSection } from '@shared-types/config';

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

function ensureDomainTags(tags: ReadonlyArray<string>, fallbackKit: string): string[]{
  const normalized = normalizeTagList(tags);
  const definitions = normalized
    .map((tag) => getTagDefinition(tag))
    .filter((definition): definition is NonNullable<ReturnType<typeof getTagDefinition>> => Boolean(definition));

  const next = [...normalized];
  const hasKit = definitions.some((definition) => definition.domain === 'kit');
  const hasEffectOrTargeting = definitions.some((definition) => definition.domain === 'effect' || definition.domain === 'targeting');

  if (!hasKit){
    next.push(fallbackKit);
  }
  if (!hasEffectOrTargeting){
    next.push('single-target');
  }

  return normalizeTagList(next);
}

function fallbackKitTag(sectionType: string | null | undefined): string {
  if (sectionType === 'talent') return 'passive';
  return 'active';
}

function normalizeNotes(notes: SkillSection['notes'] | string | null | undefined): ReadonlyArray<string> | undefined {
  if (Array.isArray(notes)) return [...notes];
  if (typeof notes === 'string') return [notes];
  return undefined;
}

function normalizeSection(section: SkillSection | string | null | undefined): SkillSection | null{
  if (!section) return null;
  if (typeof section === 'string'){
    return normalizeSkillEntry({ name: '', description: section, type: 'active' } as SkillSection);
  }
  return normalizeSkillEntry(section);
}

function normalizeSkillEntry(entry: SkillSection | null | undefined): SkillSection | null{
  if (!entry) return null;
  const normalized: SkillSection = { ...entry };
  normalized.tags = ensureDomainTags(entry.tags ?? [], fallbackKitTag(entry.type ?? null));
  if (entry.cost && typeof entry.cost === 'object'){
    normalized.cost = { ...entry.cost };
  }
  normalized.notes = normalizeNotes(entry.notes);
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

function isUnknownRecord(value: unknown): value is UnknownRecord{
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toSkillSection(value: unknown, fallbackType: SkillSection['type'] = 'active'): SkillSection | null{
  if (!isUnknownRecord(value)) return null;
  const name = typeof value.name === 'string' ? value.name : '';
  const type = typeof value.type === 'string' ? value.type : fallbackType;
  const description = typeof value.description === 'string'
    ? value.description
    : (typeof value.notes === 'string' ? value.notes : '');
  const tags = Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === 'string') : [];
  const section: SkillSection = {
    ...value,
    name,
    type,
    description,
    tags: ensureDomainTags(tags, fallbackKitTag(type))
  } as SkillSection;
  if (isUnknownRecord(value.cost)){
    section.cost = { ...value.cost };
  }
  section.notes = Array.isArray(value.notes)
    ? value.notes.filter((note): note is string => typeof note === 'string')
    : normalizeNotes(typeof value.notes === 'string' ? value.notes : undefined);
  return section;
}

function buildBaseSkillSetsFromRoster(): Record<UnitId, SkillEntry>{
  return ROSTER.reduce<Record<UnitId, SkillEntry>>((acc, unit) => {
    const unitId = unit.id as UnitId;
    const kitRecord: Record<string, unknown> = isUnknownRecord(unit.kit) ? unit.kit : {};
    const skills = Array.isArray(kitRecord.skills)
      ? kitRecord.skills.map((skill: unknown) => toSkillSection(skill)).filter(isSkillSection)
      : [];
    const normalized: SkillEntry = {
      unitId,
      basic: toSkillSection(kitRecord.basic, 'basic'),
      skill: skills[0] ?? null,
      skills,
      ult: toSkillSection(kitRecord.ult, 'ultimate'),
      talent: toSkillSection(kitRecord.talent, 'talent'),
      technique: toSkillSection(kitRecord.technique, 'technique'),
      notes: []
    };
    deepFreeze(normalized);
    acc[unitId] = normalized;
    return acc;
  }, {});
}

const RawSkillSetSchema = z.object({
  unitId: z.string()
});
const RawSkillSetListSchema = z.array(RawSkillSetSchema);
const rawSkillSets = RawSkillSetListSchema.parse(rawSkillSetsConfig) as ReadonlyArray<RawSkillSet>;

function collectUnknownSkillTags(skill: SkillSection | null | undefined): string[]{
  if (!skill || !Array.isArray(skill.tags)) return [];
  return listUnknownTags(skill.tags);
}

const SKILL_KEYS = ['basic', 'skill', 'skills', 'ult', 'talent', 'technique', 'notes'] as const satisfies ReadonlyArray<keyof SkillEntry | 'skill'>;

const skillSets: Readonly<Record<UnitId, SkillEntry>> = rawSkillSets.reduce<Record<UnitId, SkillEntry>>((acc, entry) => {
  const current = acc[entry.unitId] ?? {
    unitId: entry.unitId,
    basic: null,
    skill: null,
    skills: [],
    ult: null,
    talent: null,
    technique: null,
    notes: [],
  };
  const skills = Array.isArray(entry.skills)
    ? entry.skills.map(normalizeSkillEntry).filter(isSkillSection)
  : current.skills;
  const skill = entry.skill
    ? normalizeSkillEntry(entry.skill)
    : (('skills' in entry) ? (skills[0] ?? null) : (current.skill ?? skills[0] ?? null));
  const normalized: SkillEntry = {
    unitId: entry.unitId,
    basic: ('basic' in entry) ? normalizeSection(entry.basic) : current.basic,
    skill,
    skills,
    ult: ('ult' in entry) ? normalizeSection(entry.ult) : current.ult,
    talent: ('talent' in entry) ? normalizeSection(entry.talent) : current.talent,
    technique: ('technique' in entry) ? normalizeSection(entry.technique) : current.technique,
    notes: ('notes' in entry)
      ? (Array.isArray(entry.notes) ? [...entry.notes] : (entry.notes ? [entry.notes] : []))
      : current.notes
  };
  deepFreeze(normalized);
  const unknownTags = [
    ...collectUnknownSkillTags(normalized.basic),
    ...collectUnknownSkillTags(normalized.skill),
    ...collectUnknownSkillTags(normalized.ult),
    ...collectUnknownSkillTags(normalized.talent),
    ...collectUnknownSkillTags(normalized.technique),
    ...normalized.skills.flatMap(collectUnknownSkillTags),
  ];
  if (unknownTags.length){
    const uniqueUnknown = Array.from(new Set(unknownTags));
    console.warn(`[skills] Unknown tag(s) for ${entry.unitId}: ${uniqueUnknown.join(', ')}`);
  }
  acc[entry.unitId] = normalized;
  return acc;
}, buildBaseSkillSetsFromRoster());

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

export interface SkillTagValidationIssue {
  unitId: UnitId;
  section: string;
  unknownTags: ReadonlyArray<string>;
  missingKitDomain: boolean;
  missingEffectOrTargetingDomain: boolean;
}

function collectValidationIssues(): SkillTagValidationIssue[]{
  const issues: SkillTagValidationIssue[] = [];
  const pushIssue = (unitId: UnitId, section: string, tags: ReadonlyArray<string>): void => {
    const normalized = normalizeTagList(tags);
    const definitions = normalized.map((tag) => getTagDefinition(tag));
    const unknownTags = normalized.filter((_, index) => !definitions[index]);
    const known = definitions.filter((definition): definition is NonNullable<typeof definition> => Boolean(definition));
    const missingKitDomain = !known.some((definition) => definition.domain === 'kit');
    const missingEffectOrTargetingDomain = !known.some((definition) => definition.domain === 'effect' || definition.domain === 'targeting');
    if (unknownTags.length > 0 || missingKitDomain || missingEffectOrTargetingDomain){
      issues.push({ unitId, section, unknownTags, missingKitDomain, missingEffectOrTargetingDomain });
    }
  };

  for (const entry of Object.values(skillSets)){
    if (entry.basic) pushIssue(entry.unitId, 'basic', entry.basic.tags ?? []);
    if (entry.skill) pushIssue(entry.unitId, 'skill', entry.skill.tags ?? []);
    if (entry.ult) pushIssue(entry.unitId, 'ult', entry.ult.tags ?? []);
    if (entry.talent) pushIssue(entry.unitId, 'talent', entry.talent.tags ?? []);
    if (Array.isArray(entry.skills)){
      entry.skills.forEach((skill: SkillSection, index: number) => pushIssue(entry.unitId, `skills[${index}]`, skill.tags ?? []));
    }
  }

  return issues;
}

export const SKILL_TAG_VALIDATION_ISSUES = Object.freeze(collectValidationIssues());

if (SKILL_TAG_VALIDATION_ISSUES.length > 0){
  console.warn('[skills] tag validation issues detected:', SKILL_TAG_VALIDATION_ISSUES);
}