import { ROSTER } from '../catalog.ts';
import { getSkillSet } from './skills.ts';

import type { UnitId } from '@shared-types/units';

export interface CampaignStageDefinition {
  id: string;
  nodeId: string;
  title: string;
  chapter: string;
  bossId: UnitId;
  recommendedPower: string;
  bossQuote: string;
  status: 'locked' | 'open' | 'cleared';
  stars: number;
  passives: ReadonlyArray<{ id: string; name: string; icon: string; description: string }>;
  skills: ReadonlyArray<{ id: string; name: string }>;
}

const PASSIVE_ICON_MAP: Readonly<Record<string, string>> = {
  bleed: 'assets/weaken.svg',
  reflect: 'assets/reflect.svg',
  damagecut: 'assets/damageCut.svg',
  damage_cut: 'assets/damageCut.svg',
  pierce: 'assets/pierce.svg',
  haste: 'assets/haste.svg',
  weaken: 'assets/weaken.svg',
  silence: 'assets/silence.svg',
  exalt: 'assets/exalt.svg',
};

const STAGE_BLUEPRINT = [
  {
    id: '1-1',
    nodeId: 'n-1-1',
    title: 'Khởi Phong Sơn Lộ',
    chapter: 'The Fool\'s Journey',
    bossId: 'mong_yem',
    recommendedPower: '12.000',
    bossQuote: '“Giấc mộng không phải nơi để ngươi tỉnh dậy.”',
    status: 'cleared',
    stars: 3,
    passiveIds: ['weaken', 'silence'],
  },
  {
    id: '1-2',
    nodeId: 'n-1-2',
    title: 'Tàn Ảnh Ma Cốc',
    chapter: 'The Fool\'s Journey',
    bossId: 'chan_nga',
    recommendedPower: '14.500',
    bossQuote: '“Bản ngã thật sự luôn xuất hiện ở lần triệu hồi cuối.”',
    status: 'open',
    stars: 1,
    passiveIds: ['reflect', 'pierce'],
  },
  {
    id: '1-3',
    nodeId: 'n-1-3',
    title: 'Phong Cấm Cổ Đàn',
    chapter: 'The Fool\'s Journey',
    bossId: 'loithienanh',
    recommendedPower: '18.200',
    bossQuote: '“Nhập trận nếu đạo tâm ngươi đủ cứng.”',
    status: 'locked',
    stars: 0,
    passiveIds: ['damageCut', 'bleed', 'reflect'],
  },
] as const;

const rosterNameById = new Map(ROSTER.map((unit) => [unit.id, unit.name]));

function resolveIcon(passiveId: string): string {
  const key = passiveId.replace(/[^a-zA-Z]/g, '').toLowerCase();
  return PASSIVE_ICON_MAP[key] ?? 'assets/exalt.svg';
}

function toPassive(passiveId: string) {
  return {
    id: passiveId,
    name: passiveId,
    icon: resolveIcon(passiveId),
    description: `Hiệu ứng ${passiveId} có thể thay đổi nhịp chiến đấu.`,
  };
}

export const CAMPAIGN_STAGE_DATA: ReadonlyArray<CampaignStageDefinition> = STAGE_BLUEPRINT.map((stage) => {
  const skillSet = getSkillSet(stage.bossId);
  const stageSkills = [skillSet?.basic, ...(skillSet?.skills ?? []), skillSet?.ult]
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .slice(0, 4)
    .map((skill, index) => ({
      id: `${stage.id}-skill-${index + 1}`,
      name: skill.name || `Kỹ năng ${index + 1}`,
    }));

  return {
    ...stage,
    bossId: stage.bossId as UnitId,
    title: `${stage.id} · ${stage.title}`,
    passives: stage.passiveIds.map(toPassive),
    skills: stageSkills,
    bossQuote: stage.bossQuote,
    chapter: stage.chapter,
    recommendedPower: stage.recommendedPower,
    status: stage.status,
    stars: stage.stars,
  } satisfies CampaignStageDefinition;
});

export function resolveBossName(unitId: UnitId): string {
  return rosterNameById.get(unitId) || unitId;
}
