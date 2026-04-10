import { asRecord, toFiniteNumber } from './number-utils.ts';

import type { SkillSection } from '@shared-types/config';

type SkillRecord = Record<string, unknown>;

function resolveSkillRootRecords(skill: SkillSection): {
  root: SkillRecord;
  metadata: SkillRecord | null;
  meta: SkillRecord | null;
  payload: SkillRecord | null;
  metadataPayload: SkillRecord | null;
  metaPayload: SkillRecord | null;
} {
  const root = skill as SkillRecord;
  const metadata = asRecord(root.metadata);
  const meta = asRecord(root.meta);
  const payload = asRecord(root.payload);
  const metadataPayload = asRecord(metadata?.payload);
  const metaPayload = asRecord(meta?.payload);
  return { root, metadata, meta, payload, metadataPayload, metaPayload };
}

function collectSkillRecords(skill: SkillSection): SkillRecord[] {
  const { root, metadata, meta, payload, metadataPayload, metaPayload } = resolveSkillRootRecords(skill);
  const records: SkillRecord[] = [];
  const seen = new Set<SkillRecord>();
  const pushUnique = (record: SkillRecord | null): void => {
    if (!record || seen.has(record)) return;
    seen.add(record);
    records.push(record);
  };
  pushUnique(root);
  pushUnique(payload);
  pushUnique(metadata);
  pushUnique(metadataPayload);
  pushUnique(meta);
  pushUnique(metaPayload);
  return records;
}

export function resolveSkillPayload(skill: SkillSection): SkillRecord {
  const { root, payload, metadataPayload, metaPayload } = resolveSkillRootRecords(skill);
  const payloadCandidates = [payload, metadataPayload, metaPayload];
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
