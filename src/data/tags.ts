export type TagDomain =
  | 'timing'
  | 'targeting'
  | 'delivery'
  | 'effect'
  | 'resource'
  | 'rule'
  | 'kit';

export interface TagDefinition {
  id: string;
  label: string;
  domain: TagDomain;
  aliases?: ReadonlyArray<string>;
  note?: string;
}

export type TagAliasVersion = 'v1';

export const CURRENT_TAG_ALIAS_VERSION: TagAliasVersion = 'v1';

const TAG_DEFINITIONS = [
  { id: 'instant', label: 'Lập tức', domain: 'timing', aliases: ['instant-cast', 'instantCast', 'lap_tuc'] },
  { id: 'passive', label: 'Nội tại', domain: 'kit', aliases: ['noi_tai', 'passive-trigger'] },
  { id: 'active', label: 'Chủ động', domain: 'kit', aliases: ['chu_dong'] },
  { id: 'single-target', label: 'Đơn mục tiêu', domain: 'targeting', aliases: ['don_muc_tieu'] },
  { id: 'multi-target', label: 'Đa mục tiêu', domain: 'targeting', aliases: ['da_muc_tieu'] },
  { id: 'aoe', label: 'Aoe cố định', domain: 'targeting', aliases: ['area', 'aoe-fixed'] },
  { id: 'random-target', label: 'Mục tiêu ngẫu nhiên', domain: 'targeting', aliases: ['random-single'] },
  { id: 'random-aoe', label: 'Aoe ngẫu nhiên', domain: 'targeting', aliases: ['aoe-random'] },
  { id: 'self', label: 'Bản thân', domain: 'targeting', aliases: ['ban_than'] },
  { id: 'ally', label: 'Đồng minh', domain: 'targeting', aliases: ['dong_minh'] },
  { id: 'enemy', label: 'Kẻ địch', domain: 'targeting', aliases: ['ke_dich'] },
  { id: 'global-rule', label: 'Toàn sân/Quy tắc', domain: 'rule', aliases: ['quy_tac', 'all-board'] },
  { id: 'heal', label: 'Hồi phục', domain: 'effect', aliases: ['hoi_phuc'] },
  { id: 'non-heal-hp-change', label: 'Không phải hồi phục', domain: 'effect', aliases: ['khong_phai_hoi_phuc'] },
  { id: 'shield', label: 'Tạo khiên', domain: 'effect', aliases: ['barrier'] },
  { id: 'support', label: 'Hỗ trợ', domain: 'effect', aliases: ['buff-support'] },
  { id: 'control', label: 'Khống chế', domain: 'effect' },
  { id: 'defense', label: 'Phòng thủ', domain: 'effect', aliases: ['defensive', 'protection'] },
  { id: 'absolute-attack', label: 'Tuyệt đối công', domain: 'rule', aliases: ['absolute_attack', 'tuyetdoi_cong'] },
  { id: 'absolute-shield', label: 'Tuyệt đối khiên', domain: 'rule', aliases: ['absolute_shield', 'tuyetdoi_khien'] },
  { id: 'unique-global', label: 'Độc Nhất toàn chiến trường', domain: 'rule', aliases: ['doc_nhat'] },
  { id: 'aether-cost', label: 'Tiêu hao Aether', domain: 'resource', aliases: ['cost-aether'] },
  { id: 'revive', label: 'Hồi sinh', domain: 'effect' },
  { id: 'summon', label: 'Triệu hồi', domain: 'effect' },
  { id: 'basic-attack', label: 'Đánh thường', domain: 'delivery', aliases: ['counts-as-basic', 'basic'] },
  { id: 'burst', label: 'Dồn sát thương', domain: 'delivery' },
  { id: 'line', label: 'Đường thẳng', domain: 'targeting', aliases: ['line-target'] },
  { id: 'field', label: 'Hiệu ứng sân', domain: 'targeting' },
  { id: 'blink', label: 'Dịch chuyển', domain: 'delivery' },
  { id: 'execute', label: 'Kết liễu', domain: 'delivery', aliases: ['finisher'] },
  { id: 'pierce', label: 'Xuyên giáp/kháng', domain: 'effect', aliases: ['armor-pierce', 'armor_pierce'] },
  { id: 'mark', label: 'Đánh dấu', domain: 'effect', aliases: ['mark-builder', 'mark-detonation'] },
  { id: 'stance', label: 'Chuyển dạng', domain: 'kit', aliases: ['form-scaling'] },
  { id: 'team-heal', label: 'Hồi phục đội', domain: 'effect' },
  { id: 'self-buff', label: 'Tự cường hóa', domain: 'effect', aliases: ['buff'] },
  { id: 'chain', label: 'Liên kích/chuỗi', domain: 'delivery' },
  { id: 'poison', label: 'Độc', domain: 'effect' },
  { id: 'silence', label: 'Câm lặng', domain: 'effect' },
  { id: 'sleep', label: 'Ngủ', domain: 'effect', aliases: ['sleep-setup'] },
  { id: 'taunt', label: 'Khiêu khích', domain: 'effect' },
] as const satisfies ReadonlyArray<TagDefinition>;

const normalizeKey = (value: string): string => value.trim().toLowerCase();

const TAG_BY_ID = new Map<string, TagDefinition>();
for (const definition of TAG_DEFINITIONS){
  TAG_BY_ID.set(normalizeKey(definition.id), definition);
  const aliases = 'aliases' in definition && Array.isArray(definition.aliases) ? definition.aliases : [];
  for (const alias of aliases){
    TAG_BY_ID.set(normalizeKey(alias), definition);
  }
}

export const tagAliasesByVersion: Readonly<Record<TagAliasVersion, Readonly<Record<string, string>>>> = Object.freeze({
  v1: Object.freeze({
    cone: 'multi-target',
    drain: 'non-heal-hp-change',
    beast: 'active',
    seed: 'mark',
    arcane: 'support',
    flying: 'blink',
    weather: 'field',
    clone: 'summon',
    splash: 'aoe',
    evolution: 'stance',
    'multi-hit': 'chain',
    time: 'control',
    lifesteal: 'non-heal-hp-change',
    'hp-drain': 'non-heal-hp-change',
    column: 'line',
    'spd-debuff': 'control',
    'hp-trade': 'non-heal-hp-change',
    'hp-redistribute': 'non-heal-hp-change',
    haste: 'support',
    reflect: 'defense',
  }),
});

const TAG_ALIAS_BY_VERSION_KEY = new Map<string, string>();
for (const [version, aliases] of Object.entries(tagAliasesByVersion)){
  for (const [from, to] of Object.entries(aliases)){
    TAG_ALIAS_BY_VERSION_KEY.set(`${version}:${normalizeKey(from)}`, to);
  }
}

export const GAME_TAGS = Object.freeze(TAG_DEFINITIONS);

export const TAG_IDS = Object.freeze(
  Array.from(new Set(TAG_DEFINITIONS.map((definition) => definition.id)))
);

export const TAG_IDS_BY_DOMAIN = Object.freeze(
  TAG_DEFINITIONS.reduce<Record<TagDomain, ReadonlyArray<string>>>((acc, definition) => {
    const current = acc[definition.domain] ?? [];
    acc[definition.domain] = Object.freeze([...current, definition.id]);
    return acc;
  }, {
    timing: [],
    targeting: [],
    delivery: [],
    effect: [],
    resource: [],
    rule: [],
    kit: [],
  })
);

export const INSTANT_TAG_IDS = Object.freeze(['instant']);
export const DEFENSIVE_TAG_IDS = Object.freeze(['defense', 'shield', 'support']);
export const ABSOLUTE_ATTACK_TAG_IDS = Object.freeze(['absolute-attack']);
export const ABSOLUTE_SHIELD_TAG_IDS = Object.freeze(['absolute-shield']);

function resolveVersionAlias(
  tag: string,
  version: TagAliasVersion = CURRENT_TAG_ALIAS_VERSION,
): string {
  return TAG_ALIAS_BY_VERSION_KEY.get(`${version}:${normalizeKey(tag)}`) ?? tag;
}

export function normalizeTagId(
  tag: string | null | undefined,
  version: TagAliasVersion = CURRENT_TAG_ALIAS_VERSION,
): string | null{
  if (typeof tag !== 'string') return null;
  const normalized = normalizeKey(resolveVersionAlias(tag, version));
  if (!normalized) return null;
  return TAG_BY_ID.get(normalized)?.id ?? normalized;
}

export function normalizeTagList(
  tags: ReadonlyArray<string> | null | undefined,
  version: TagAliasVersion = CURRENT_TAG_ALIAS_VERSION,
): string[]{
  if (!Array.isArray(tags)) return [];
  const unique = new Set<string>();
  for (const tag of tags){
    const normalized = normalizeTagId(tag, version);
    if (normalized) unique.add(normalized);
  }
  return [...unique];
}

export function resolveTagVersionAliases(
  tags: ReadonlyArray<string> | null | undefined,
  version: TagAliasVersion = CURRENT_TAG_ALIAS_VERSION,
): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.map((tag) => resolveVersionAlias(tag, version));
}

export function getTagDefinition(tag: string | null | undefined): TagDefinition | null {
  const normalized = normalizeTagId(tag);
  if (!normalized) return null;
  return TAG_BY_ID.get(normalized) ?? null;
}

export function listUnknownTags(tags: ReadonlyArray<string> | null | undefined): string[]{
  if (!Array.isArray(tags)) return [];
  const unknown = new Set<string>();
  for (const rawTag of tags){
    if (typeof rawTag !== 'string') continue;
    const normalizedRaw = normalizeKey(rawTag);
    if (!normalizedRaw) continue;
    if (!TAG_BY_ID.has(normalizedRaw)){
      unknown.add(rawTag.trim());
    }
  }
  return [...unknown];
}

export function hasAnyTag(haystack: ReadonlyArray<string>, needles: ReadonlyArray<string>): boolean{
  const normalizedHaystack = new Set(normalizeTagList(haystack));
  return needles.some((needle) => normalizedHaystack.has(needle));
}
