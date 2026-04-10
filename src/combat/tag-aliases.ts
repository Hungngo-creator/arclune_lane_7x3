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
});

function normalizeAliasLookupKey(tag: string): string {
  return tag
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function normalizeCombatTag(tag: string): string {
  const normalized = normalizeAliasLookupKey(tag);
  return COMBAT_TAG_ALIASES[normalized] ?? normalized;
}

export function normalizeCombatTagList(tags: ReadonlyArray<string> | null | undefined): string[] {
  if (!Array.isArray(tags) || tags.length === 0) return [];
  const normalized: string[] = [];
  const seen = new Set<string>();
  for (const tag of tags) {
    const next = normalizeCombatTag(tag);
    if (seen.has(next)) continue;
    seen.add(next);
    normalized.push(next);
  }
  return normalized;
}
