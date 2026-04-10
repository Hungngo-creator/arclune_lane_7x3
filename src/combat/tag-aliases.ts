const COMBAT_TAG_ALIASES = Object.freeze<Record<string, string>>({
  // Existing aliases
  'self-and-ally': 'ally',
  'ally-and-self': 'ally',
  'ban_than_lan_dong_minh': 'ally',
  'ban-than-lan-dong-minh': 'ally',
  'ban than lan dong minh': 'ally',
  'bản thân lẫn đồng minh': 'ally',
  'random-single': 'random-target',
  'single-target-random': 'random-target',
  'đơn mục tiêu ngẫu nhiên': 'random-target',
  'all-enemy': 'aoe',
  'kẻ địch': 'enemy',
  'lap-tuc': 'instant',
  'lập tức': 'instant',
  'quy tắc': 'global-rule',
  'quy-tac': 'global-rule',
  'pháp tắc': 'doctrine-rule',
  'phap-tac': 'doctrine-rule',
  'pháp tắc: luyện ngục kiếm trận': 'doctrine-rule',
  'phap-tac-luyen-nguc-kiem-tran': 'doctrine-rule',
  'muc-tieu-leader': 'leader-target',
  'mục tiêu leader': 'leader-target',
  'mục tiêu: leader': 'leader-target',
  'target-leader': 'leader-target',

  // Character-design aliases from idea documents
  'đơn mục tiêu': 'single-target',
  'don-muc-tieu': 'single-target',
  'đa mục tiêu': 'multi-target',
  'da-muc-tieu': 'multi-target',
  'ngẫu nhiên: kẻ địch': 'random-aoe',
  'ngau-nhien-ke-dich': 'random-aoe',
  'ngẫu nhiên: đồng minh': 'ally',
  'ngau-nhien-dong-minh': 'ally',
  'aoe: toàn sân': 'aoe',
  'aoe-toan-san': 'aoe',
  'toàn sân': 'aoe',
  'toan-san': 'aoe',
  'bản thân': 'self',
  'ban-than': 'self',
  'tiêu hao: aether': 'aether-cost',
  'tieu-hao-aether': 'aether-cost',
  'tiêu hao: hp': 'hp-cost',
  'tieu-hao-hp': 'hp-cost',
  'hồi phục': 'heal',
  'hoi-phuc': 'heal',
  'không phải hồi phục': 'non-heal-hp-change',
  'khong-phai-hoi-phuc': 'non-heal-hp-change',
  'khống chế: câm lặng': 'silence',
  'khong-che-cam-lang': 'silence',
  'độc nhất': 'unique-global',
  'doc-nhat': 'unique-global',
  'điều kiện': 'condition',
  'dieu-kien': 'condition',
  'aoe cố định': 'aoe',
  'aoe co dinh': 'aoe',
  'aoe ngẫu nhiên': 'random-aoe',
  'aoe ngau nhien': 'random-aoe',
  'đa mục tiêu: đồng minh': 'ally',
  'da muc tieu: dong minh': 'ally',
  'aoe: toàn bộ kẻ địch': 'aoe',
  'aoe: toan bo ke dich': 'aoe',
  'khống chế: ngủ': 'sleep',
  'khong-che-ngu': 'sleep',
  'khống chế: khiêu khích': 'taunt',
  'khong-che-khieu-khich': 'taunt',
  'câm lặng': 'silence',
  'cam-lang': 'silence',
  'tạo khiên': 'shield',
  'tao-khien': 'shield',
  'hồi phục đội': 'team-heal',
  'hoi-phuc-doi': 'team-heal',
  'đa mục tiêu ngẫu nhiên': 'random-aoe',
  'da-muc-tieu-ngau-nhien': 'random-aoe',
  'quy tắc: tái sinh': 'global-rule',
  'quy-tac-tai-sinh': 'global-rule',
  'quy tắc: cấm hồi sinh': 'global-rule',
  'quy-tac-cam-hoi-sinh': 'global-rule',
  'quy tắc: bất tử': 'global-rule',
  'quy-tac-bat-tu': 'global-rule',
  'pháp tắc: kiên định': 'doctrine-rule',
  'phap-tac-kien-dinh': 'doctrine-rule',
  'pháp tắc: cấm chữa trị': 'doctrine-rule',
  'phap-tac-cam-chua-tri': 'doctrine-rule',
  'pháp tắc: cấm hồi phục': 'doctrine-rule',
  'phap-tac-cam-hoi-phuc': 'doctrine-rule',
  'tuyệt đối': 'axiom-rule',
  'tuyet-doi': 'axiom-rule',
  'quy tắc: bất động như sơn': 'global-rule',
  'quy-tac-bat-dong-nhu-son': 'global-rule',
  'quy tắc: sự trở về của hư không': 'global-rule',
  'quy-tac-su-tro-ve-cua-hu-khong': 'global-rule',
  'axiom': 'axiom-rule',
  'axiom-rule': 'axiom-rule',
  'tiên đề': 'axiom-rule',
  'tien-de': 'axiom-rule',
  'tag cấp độ cao': 'global-rule',
  'tag-cap-do-cao': 'global-rule',
  'cấp độ cao hơn pháp tắc': 'global-rule',
  'cap-do-cao-hon-phap-tac': 'global-rule',
  'sát thương tự thân': 'non-heal-hp-change',
  'sat-thuong-tu-than': 'non-heal-hp-change',
  'aoe: hàng dọc': 'column-aoe',
  'aoe-hang-doc': 'column-aoe',
  'aoe hàng dọc': 'column-aoe',
  'hang-doc': 'column-aoe',
  'aoe: vùng chữ thập': 'cross-aoe',
  'aoe-vung-chu-thap': 'cross-aoe',
  'vùng chữ thập': 'cross-aoe',
  'vung-chu-thap': 'cross-aoe',
  'vùng chữ +': 'cross-aoe',
  'vung-chu-+': 'cross-aoe',
  'tự động': 'instant',
  'tu-dong': 'instant',
  // Lore/character idea tag aliases (Huyết, Hư giới, Nhân vật mới)
  'huyết giáp': 'shield',
  'huyet-giap': 'shield',
  'huyết nô': 'summon',
  'huyet-no': 'summon',
  'huyết tế': 'hp-cost',
  'huyet-te': 'hp-cost',
  'huyết hải lĩnh vực': 'global-rule',
  'huyet-hai-linh-vuc': 'global-rule',
  'huyết thần lĩnh vực': 'global-rule',
  'huyet-than-linh-vuc': 'global-rule',
  'huyết thần': 'axiom-rule',
  'huyet-than': 'axiom-rule',
  'thần tính': 'axiom-rule',
  'than-tinh': 'axiom-rule',
  'divine-nature': 'axiom-rule',
  'than_tinh': 'axiom-rule',
  'thần_tính': 'axiom-rule',
  'hư kỹ': 'instant',
  'hu-ky': 'instant',
  'hư quyết': 'condition',
  'hu-quyet': 'condition',
  'kiếm vực': 'global-rule',
  'kiem-vuc': 'global-rule',
  'huyễn ảnh': 'random-aoe',
  'huyen-anh': 'random-aoe',
  'trăng và bóng tối': 'silence',
  'trang-va-bong-toi': 'silence',
  'rừng cấm': 'taunt',
  'rung-cam': 'taunt',
});

const COMBAT_TAG_PRIORITY = Object.freeze<Record<string, number>>({
  'axiom-rule': 500,
  'global-rule': 400,
  'doctrine-rule': 300,
  'single-target': 220,
  'leader-target': 220,
  self: 220,
  ally: 220,
  enemy: 220,
  'random-target': 210,
  'multi-target': 210,
  'random-aoe': 210,
  'column-aoe': 210,
  'cross-aoe': 210,
  aoe: 200,
});

type RuleTag = 'doctrine-rule' | 'global-rule' | 'axiom-rule';
const RULE_TAG_SET = new Set<RuleTag>(['doctrine-rule', 'global-rule', 'axiom-rule']);
const RULE_TAG_ALIAS_TO_CANONICAL = Object.freeze<Record<string, RuleTag>>({
  axiom: 'axiom-rule',
  'axiom-rule': 'axiom-rule',
  'tien-de': 'axiom-rule',
  'tiên đề': 'axiom-rule',
  'than-tinh': 'axiom-rule',
  'thần tính': 'axiom-rule',
  'thần_tính': 'axiom-rule',
  'than_tinh': 'axiom-rule',
  'divine-nature': 'axiom-rule',
  'global-rule': 'global-rule',
  'quy tắc': 'global-rule',
  'quy-tac': 'global-rule',
  'doctrine-rule': 'doctrine-rule',
  'pháp tắc': 'doctrine-rule',
  'phap-tac': 'doctrine-rule',
});

const RULE_TAG_PRIORITY = Object.freeze<Record<RuleTag, number>>({
  'doctrine-rule': COMBAT_TAG_PRIORITY['doctrine-rule'] ?? 0,
  'global-rule': COMBAT_TAG_PRIORITY['global-rule'] ?? 0,
  'axiom-rule': COMBAT_TAG_PRIORITY['axiom-rule'] ?? 0,
});

export function hasRuleTagAtLeast(tags: ReadonlyArray<string>, minimum: RuleTag): boolean {
  const minimumPriority = RULE_TAG_PRIORITY[minimum] ?? 0;
  for (const tag of tags) {
    const priority = RULE_TAG_PRIORITY[tag as RuleTag];
    if ((priority ?? -1) >= minimumPriority) return true;
  }
  return false;
}

export interface CanonicalizedCombatTags {
  tags: string[];
  highestRuleTag: RuleTag | null;
}

function normalizeAliasLookupKey(tag: string): string {
  return tag
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function normalizeCombatTag(tag: string): string {
  const normalized = normalizeAliasLookupKey(tag);
  return RULE_TAG_ALIAS_TO_CANONICAL[normalized] ?? COMBAT_TAG_ALIASES[normalized] ?? normalized;
}

function normalizeCanonicalInputTag(tag: string): string {
  const normalized = normalizeAliasLookupKey(tag);
  return RULE_TAG_ALIAS_TO_CANONICAL[normalized] ?? normalized;
}

export function canonicalizeCombatTags(
  tags: ReadonlyArray<string> | null | undefined,
  treatAsCanonical = false,
): string[] {
  return canonicalizeCombatTagsWithRule(tags, treatAsCanonical).tags;
}

export function canonicalizeCombatTagsWithRule(
  tags: ReadonlyArray<string> | null | undefined,
  treatAsCanonical = false,
): CanonicalizedCombatTags {
  if (!Array.isArray(tags) || tags.length === 0) {
    return { tags: [], highestRuleTag: null };
  }

  const unique: string[] = [];
  const seen = new Set<string>();
  let highestRuleTag: RuleTag | null = null;
  let highestRulePriority = -1;

  for (const rawTag of tags) {
    const tag = treatAsCanonical ? normalizeCanonicalInputTag(rawTag) : normalizeCombatTag(rawTag);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    unique.push(tag);

    const normalizedRuleTag = tag as RuleTag;
    const rulePriority = RULE_TAG_PRIORITY[normalizedRuleTag];
    if (rulePriority == null || rulePriority <= highestRulePriority) continue;
    highestRuleTag = normalizedRuleTag;
    highestRulePriority = rulePriority;
  }

  const filtered = highestRuleTag
    ? unique.filter((tag) => !RULE_TAG_SET.has(tag as RuleTag) || tag === highestRuleTag)
    : unique;
  if (filtered.length <= 1) {
    return {
      tags: filtered,
      highestRuleTag,
    };
  }

  filtered.sort((left, right) => {
    const leftPriority = COMBAT_TAG_PRIORITY[left] ?? 0;
    const rightPriority = COMBAT_TAG_PRIORITY[right] ?? 0;
    return rightPriority - leftPriority;
  });
  return {
    tags: filtered,
    highestRuleTag,
  };
}
