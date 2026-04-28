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
const TAG_DOMAINS: ReadonlyArray<TagDomain> = Object.freeze([
  'timing',
  'targeting',
  'delivery',
  'effect',
  'resource',
  'rule',
  'kit',
]);

const TAG_DEFINITIONS = [
  { id: 'instant', label: 'Lập tức', domain: 'timing', aliases: ['instant-cast', 'instantCast', 'lap_tuc'] },
  { id: 'passive', label: 'Nội tại', domain: 'kit', aliases: ['noi_tai', 'passive-trigger', 'tu_dong', 'tự_động', 'noi tai', 'nội tại', 'tu dong', 'tự động'] },
  { id: 'active', label: 'Chủ động', domain: 'kit', aliases: ['chu_dong', 'chu dong', 'chủ động'] },
  { id: 'single-target', label: 'Đơn mục tiêu', domain: 'targeting', aliases: ['don_muc_tieu', 'đơn_mục_tiêu', 'don muc tieu', 'đơn mục tiêu'] },
  { id: 'multi-target', label: 'Đa mục tiêu', domain: 'targeting', aliases: ['da_muc_tieu'] },
  { id: 'aoe', label: 'Aoe cố định', domain: 'targeting', aliases: ['area', 'aoe-fixed', 'aoe_hang_doc', 'aoe_vung_chu_thap', 'aoe_toan_san', 'aoe cố định', 'aoe: hàng dọc', 'aoe: vùng chữ thập', 'aoe: toàn sân'] },
  { id: 'random-target', label: 'Mục tiêu ngẫu nhiên', domain: 'targeting', aliases: ['random-single'] },
  { id: 'random-aoe', label: 'Aoe ngẫu nhiên', domain: 'targeting', aliases: ['aoe-random', 'aoe ngẫu nhiên', 'aoe: ngẫu nhiên'] },
  { id: 'self', label: 'Bản thân', domain: 'targeting', aliases: ['ban_than'] },
  { id: 'ally', label: 'Đồng minh', domain: 'targeting', aliases: ['dong_minh'] },
  { id: 'enemy', label: 'Kẻ địch', domain: 'targeting', aliases: ['ke_dich'] },
  { id: 'global-rule', label: 'Toàn sân/Quy tắc', domain: 'rule', aliases: ['quy_tac', 'quy tac', 'quy tắc', 'all-board', 'rule'] },
  { id: 'heal', label: 'Hồi phục', domain: 'effect', aliases: ['hoi_phuc', 'hoi phuc', 'hồi phục'] },
  { id: 'non-heal-hp-change', label: 'Không phải hồi phục', domain: 'effect', aliases: ['khong_phai_hoi_phuc'] },
  { id: 'shield', label: 'Tạo khiên', domain: 'effect', aliases: ['barrier', 'tao_khien', 'tạo_khiên', 'tao khien', 'tạo khiên'] },
  { id: 'support', label: 'Hỗ trợ', domain: 'effect', aliases: ['buff-support', 'haste', 'rage-boost', 'rage-gain', 'formation-haste'] },
  { id: 'control', label: 'Khống chế', domain: 'effect' },
  { id: 'defense', label: 'Phòng thủ', domain: 'effect', aliases: ['defensive', 'protection', 'reflect'] },
  { id: 'absolute-attack', label: 'Tuyệt đối công', domain: 'rule', aliases: ['absolute_attack', 'tuyetdoi_cong'] },
  { id: 'absolute-shield', label: 'Tuyệt đối khiên', domain: 'rule', aliases: ['absolute_shield', 'tuyetdoi_khien'] },
  {
    id: 'divine-nature',
    label: 'Thần Tính',
    domain: 'rule',
    aliases: ['than_tinh', 'thần_tính', 'axiom'],
    note: 'Axiom: miễn nhiễm buff/debuff từ nguồn ngoài bản thân và chỉ có thể hồi sinh bởi kit của chính đơn vị đó.'
  },
  { id: 'unique-global', label: '[Độc Nhất]', domain: 'rule', aliases: ['doc_nhat'], note: 'Campaign: trên toàn chiến trường chỉ tồn tại 1 bản thể cùng unitId tại một thời điểm.' },
  { id: 'aether-cost', label: 'Tiêu hao Aether', domain: 'resource', aliases: ['cost-aether'] },
  { id: 'revive', label: 'Hồi sinh', domain: 'effect' },
  { id: 'summon', label: 'Triệu hồi', domain: 'effect' },
  { id: 'basic-attack', label: 'Đánh thường', domain: 'delivery', aliases: ['counts-as-basic', 'basic', 'thuong', 'thường', 'danh thuong', 'đánh thường'] },
  { id: 'burst', label: 'Dồn sát thương', domain: 'delivery' },
  { id: 'line', label: 'Đường thẳng', domain: 'targeting', aliases: ['line-target'] },
  { id: 'field', label: 'Hiệu ứng sân', domain: 'targeting' },
  { id: 'blink', label: 'Dịch chuyển', domain: 'delivery' },
  { id: 'execute', label: 'Kết liễu', domain: 'delivery', aliases: ['finisher'] },
  { id: 'pierce', label: 'Xuyên giáp/kháng', domain: 'effect', aliases: ['armor-pierce', 'armor_pierce'] },
  { id: 'mark', label: 'Đánh dấu', domain: 'effect', aliases: ['mark-builder', 'mark-detonation'] },
  { id: 'stance', label: 'Chuyển dạng', domain: 'kit', aliases: ['form-scaling', 'transformation', 'chuyen_dang'] },
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
  const aliases = 'aliases' in definition ? definition.aliases : undefined;
  for (const alias of aliases ?? []){
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
    transform: 'stance',
    'dual-form': 'stance',
    'coin-flip': 'control',
    clone_body: 'summon',
    'heal-share': 'non-heal-hp-change',
    minion: 'summon',
    minions: 'summon',
    'sleep-trigger': 'sleep',
    'rage-boost': 'support',
    'rage-gain': 'support',
    'hp-balance': 'non-heal-hp-change',
    'formation-haste': 'support',
  }),
});

const TAG_ALIAS_BY_VERSION = new Map<TagAliasVersion, ReadonlyMap<string, string>>();
for (const [version, aliases] of Object.entries(tagAliasesByVersion) as Array<[TagAliasVersion, Record<string, string>]>){
  const aliasByKey = new Map<string, string>();
  for (const [from, to] of Object.entries(aliases)){
    aliasByKey.set(normalizeKey(from), to);
  }
  TAG_ALIAS_BY_VERSION.set(version, aliasByKey);
}

export const GAME_TAGS = Object.freeze(TAG_DEFINITIONS);

export const TAG_IDS = Object.freeze(TAG_DEFINITIONS.map((definition) => definition.id));

export const TAG_IDS_BY_DOMAIN = Object.freeze(
  (() => {
    const byDomain = {} as Record<TagDomain, string[]>;
    for (const domain of TAG_DOMAINS){
      byDomain[domain] = [];
    }
    for (const definition of TAG_DEFINITIONS){
      byDomain[definition.domain].push(definition.id);
    }
    return Object.fromEntries(
      TAG_DOMAINS.map((domain) => [domain, Object.freeze(byDomain[domain])])
    ) as Record<TagDomain, ReadonlyArray<string>>;
  })()
);

export const INSTANT_TAG_IDS = Object.freeze(['instant']);
export const DEFENSIVE_TAG_IDS = Object.freeze(['defense', 'shield', 'support']);
export const ABSOLUTE_ATTACK_TAG_IDS = Object.freeze(['absolute-attack']);
export const ABSOLUTE_SHIELD_TAG_IDS = Object.freeze(['absolute-shield']);
export const RULE_BYPASS_TAG_IDS = Object.freeze(['global-rule']);
export const AOE_TARGET_TAG_IDS = Object.freeze(['aoe', 'random-aoe']);

function resolveVersionAlias(
  tag: string,
  version: TagAliasVersion = CURRENT_TAG_ALIAS_VERSION,
): string {
  return TAG_ALIAS_BY_VERSION.get(version)?.get(normalizeKey(tag)) ?? tag;
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
  return [...collectNormalizedTagSet(tags, version)];
}

function collectNormalizedTagSet(
  tags: ReadonlyArray<string> | null | undefined,
  version: TagAliasVersion = CURRENT_TAG_ALIAS_VERSION,
): Set<string> {
  const unique = new Set<string>();
  if (!Array.isArray(tags)) return unique;
  for (const tag of tags){
    const normalized = normalizeTagId(tag, version);
    if (normalized) unique.add(normalized);
  }
  return unique;
}

function collectNormalizedNeedleSet(
  needles: ReadonlyArray<string> | null | undefined,
  version: TagAliasVersion = CURRENT_TAG_ALIAS_VERSION,
): Set<string> {
  const normalizedNeedles = new Set<string>();
  if (!Array.isArray(needles)) return normalizedNeedles;
  for (const needle of needles){
    const normalized = normalizeTagId(needle, version);
    if (normalized) normalizedNeedles.add(normalized);
  }
  return normalizedNeedles;
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
    const trimmed = rawTag.trim();
    if (!trimmed) continue;
    const normalized = normalizeTagId(trimmed);
    if (!normalized || !TAG_BY_ID.has(normalized)){
      unknown.add(trimmed);
    }
  }
  return [...unknown];
}

export function hasAnyTag(haystack: ReadonlyArray<string>, needles: ReadonlyArray<string>): boolean{
  if (!Array.isArray(haystack) || !Array.isArray(needles) || haystack.length === 0 || needles.length === 0){
    return false;
  }
  const normalizedHaystack = collectNormalizedTagSet(haystack);
  const normalizedNeedles = collectNormalizedNeedleSet(needles);
  for (const normalizedNeedle of normalizedNeedles){
    if (normalizedHaystack.has(normalizedNeedle)) return true;
  }
  return false;
}
