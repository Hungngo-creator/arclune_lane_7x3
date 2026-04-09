import { asRecord, toFiniteNumber } from './number-utils.ts';

import type { SkillSection } from '@shared-types/config';

type SkillRecord = Record<string, unknown>;

function collectSkillRecords(skill: SkillSection): SkillRecord[] {
  const root = skill as SkillRecord;
  const metadata = asRecord(root.metadata);
  const meta = asRecord(root.meta);
  const payload = asRecord(root.payload);
  const metadataPayload = asRecord(metadata?.payload);
  const metaPayload = asRecord(meta?.payload);

  const records: SkillRecord[] = [];
  if (root) records.push(root);
  if (payload) records.push(payload);
  if (metadata) records.push(metadata);
  if (metadataPayload) records.push(metadataPayload);
  if (meta) records.push(meta);
  if (metaPayload) records.push(metaPayload);
  return records;
}

export function resolveSkillPayload(skill: SkillSection): SkillRecord {
  const root = skill as SkillRecord;
  const metadata = asRecord(root.metadata);
  const meta = asRecord(root.meta);
  const payloadCandidates = [asRecord(root.payload), asRecord(metadata?.payload), asRecord(meta?.payload)];
  const payloadRecord = payloadCandidates.find((entry) => !!entry) ?? null;
  return {
    ...(payloadRecord ?? {}),
    ...root,
  };
}

export function createSkillMetadataReader(skill: SkillSection) {
  const records = collectSkillRecords(skill);
  return {
    readNumber(fallback: number, ...keys: string[]): number {
      for (const key of keys) {
        for (const record of records) {
          const value = toFiniteNumber(record[key], NaN);
          if (Number.isFinite(value)) return value;
        }
      }
      return fallback;
    },
    readRecord(...keys: string[]): SkillRecord | undefined {
      for (const key of keys) {
        for (const record of records) {
          const value = asRecord(record[key]);
          if (value) return value;
        }
      }
      return undefined;
    },
  };
}
