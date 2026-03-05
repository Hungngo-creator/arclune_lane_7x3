import { ROSTER } from '../catalog.ts';
import { getSkillSet } from './skills.ts';

import type { UnitId } from '@shared-types/units';

export interface CampaignStageDefinition {
  id: string;
  locationId: string;
  locationName: string;
  locationLore: string;
  terrainHint: string;
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

type StageSeed = Omit<CampaignStageDefinition, 'passives' | 'skills'> & { passiveIds: string[] };

const makeStage = (stage: StageSeed): StageSeed => stage;

const STAGE_BLUEPRINT: StageSeed[] = [
  ...Array.from({ length: 10 }, (_, index) => makeStage({
    id: `1-${index + 1}`,
    locationId: 'jade-forest',
    locationName: 'Jade Forest',
    locationLore: 'Rừng ngọc phủ sương, nơi linh khí vận hành theo nhịp triều gió và các trận pháp cổ.',
    terrainHint: 'Thảm rừng rậm, suối ngầm và ngọn núi thấp bao quanh thánh địa cổ.',
    title: [
      'Khởi Phong Sơn Lộ',
      'Tàn Ảnh Ma Cốc',
      'Phong Cấm Cổ Đàn',
      'Lưu Hà Cổ Trấn',
      'Thiền Lâm Huyết Kính',
      'Cửu Bộc Hạ Lưu',
      'Yên Phong Mê Cung',
      'Thụ Tâm Linh Đàn',
      'Bích Ảnh Động Môn',
      'Mộc Thần Tế Đài',
    ][index] ?? `Stage ${index + 1}`,
    chapter: 'The Fool\'s Journey',
    bossId: (['mong_yem', 'chan_nga', 'loithienanh'] as const)[index % 3] ?? 'mong_yem',
    recommendedPower: `${12 + index * 2}.${(index % 3) * 2}00`,
    bossQuote: '“Giữ vững đạo tâm, nếu không ngươi sẽ lạc giữa tầng tầng mộng ảnh.”',
    status: (index < 4 ? 'cleared' : index === 4 ? 'open' : 'locked') as CampaignStageDefinition['status'],
    stars: index < 3 ? 3 : index < 5 ? 2 : 0,
    passiveIds: index % 2 === 0 ? ['weaken', 'silence'] : ['reflect', 'pierce'],
  })),
  ...Array.from({ length: 6 }, (_, index) => makeStage({
    id: `2-${index + 1}`,
    locationId: 'dragon-spine',
    locationName: 'Dragon Spine',
    locationLore: 'Sống lưng long mạch băng hỏa giao tranh, sấm tuyết và mảnh vảy cổ phủ khắp triền núi.',
    terrainHint: 'Dãy núi hiểm trở cắt ngang dòng sông băng, vách đá phủ tuyết mù quanh năm.',
    title: ['Tuyết Liệt Sơn Môn', 'Long Tích Băng Động', 'Phong Hồn Trường Cốc', 'Đoạn Long Vực', 'Lôi Vũ Thiên Quan', 'Tọa Tinh Tuyệt Lĩnh'][index] ?? `Stage ${index + 1}`,
    chapter: 'Spiral of Oaths',
    bossId: (['loithienanh', 'chan_nga', 'mong_yem'] as const)[index % 3] ?? 'loithienanh',
    recommendedPower: `${34 + index * 3}.500`,
    bossQuote: '“Long cốt không tha kẻ do dự.”',
    status: (index === 0 ? 'open' : 'locked') as CampaignStageDefinition['status'],
    stars: 0,
    passiveIds: ['damageCut', 'bleed', 'reflect'],
  })),
  ...Array.from({ length: 5 }, (_, index) => makeStage({
    id: `3-${index + 1}`,
    locationId: 'ember-delta',
    locationName: 'Ember Delta',
    locationLore: 'Vùng châu thổ dung nham cổ, sông đỏ phân nhánh quanh tàn tích vương triều hỏa luyện.',
    terrainHint: 'Địa hình đầm lầy tro, sông dung nham và các ngọn tháp đổ nát len giữa khe núi.',
    title: ['Huyết Hà Tiền Đồn', 'Thạch Hỏa Tế Tràng', 'Tàn Thành Dạ Triều', 'Ma Nham Cổ Mộ', 'Liệt Nhật Thần Đài'][index] ?? `Stage ${index + 1}`,
    chapter: 'Ashen Covenant',
    bossId: (['chan_nga', 'mong_yem', 'loithienanh'] as const)[index % 3] ?? 'chan_nga',
    recommendedPower: `${56 + index * 4}.800`,
    bossQuote: '“Mỗi bước chân là một lời thề bằng tro tàn.”',
    status: 'locked',
    stars: 0,
    passiveIds: ['exalt', 'pierce', 'weaken'],
  })),
];

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
    title: stage.title,
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
