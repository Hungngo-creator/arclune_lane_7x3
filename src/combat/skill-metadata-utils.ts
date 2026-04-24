import { asRecord, toFiniteNumber } from './number-utils.ts';

import type { SkillSection } from '@shared-types/config';

type SkillRecord = Record<string, unknown>;
type SkillNumberReader = (fallback: number, ...keys: string[]) => number;

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

function collectSkillRecords(
  rootRecords: ReturnType<typeof resolveSkillRootRecords>,
): SkillRecord[] {
  const { root, metadata, meta, payload, metadataPayload, metaPayload } = rootRecords;
  const collected: SkillRecord[] = [];
  const seen = new Set<SkillRecord>();
  const pushUnique = (record: SkillRecord | null): void => {
    if (!record || seen.has(record)) return;
    seen.add(record);
    collected.push(record);
  };
  pushUnique(root);
  pushUnique(payload);
  pushUnique(metadata);
  pushUnique(metadataPayload);
  pushUnique(meta);
  pushUnique(metaPayload);
  return collected;
}

function buildSkillPayload(records: ReturnType<typeof resolveSkillRootRecords>): SkillRecord {
  const { root, payload, metadataPayload, metaPayload } = records;
  const payloadCandidates = [payload, metadataPayload, metaPayload];
  const payloadRecord = payloadCandidates.find((entry) => !!entry) ?? null;
  return {
    ...(payloadRecord ?? {}),
    ...root,
  };
}

function createSkillNumberReader(records: ReadonlyArray<SkillRecord>): SkillNumberReader {
  return (fallback: number, ...keys: string[]): number => {
    for (const key of keys) {
      for (const record of records) {
        const value = toFiniteNumber(record[key], NaN);
        if (Number.isFinite(value)) return value;
      }
    }
    return fallback;
  };
}

export interface SkillMetadataContext {
  payload: SkillRecord;
  readNumber: SkillNumberReader;
  readRecord: (...keys: string[]) => SkillRecord | undefined;
}

export function createSkillMetadataContext(skill: SkillSection): SkillMetadataContext {
  const rootRecords = resolveSkillRootRecords(skill);
  const records = collectSkillRecords(rootRecords);
  const readNumber = createSkillNumberReader(records);
  return {
    payload: buildSkillPayload(rootRecords),
    readNumber,
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

export function resolveSkillPayload(skill: SkillSection): SkillRecord {
  return createSkillMetadataContext(skill).payload;
}

export function createSkillMetadataReader(skill: SkillSection) {
  const context = createSkillMetadataContext(skill);
  return {
    readNumber: context.readNumber,
    readRecord: context.readRecord,
  };
}