const ELEMENT_KEYS = [
  'fire',
  'metal',
  'wood',
  'earth',
  'lightning',
  'blood',
  'water',
  'light',
  'dark',
  'wind',
  'neutral',
] as const;

export type ElementKey = typeof ELEMENT_KEYS[number];

const ELEMENT_KEY_SET = new Set<string>(ELEMENT_KEYS);

const ELEMENT_ALIAS_MAP: Readonly<Record<string, ElementKey>> = {
  fire: 'fire',
  hoa: 'fire',
  hoả: 'fire',
  hỏa: 'fire',
  metal: 'metal',
  kim: 'metal',
  wood: 'wood',
  moc: 'wood',
  mộc: 'wood',
  earth: 'earth',
  tho: 'earth',
  thổ: 'earth',
  lightning: 'lightning',
  loi: 'lightning',
  lôi: 'lightning',
  blood: 'blood',
  huyet: 'blood',
  huyết: 'blood',
  water: 'water',
  thuy: 'water',
  thủy: 'water',
  light: 'light',
  quang: 'light',
  anhsang: 'light',
  'anh sang': 'light',
  'ánh sáng': 'light',
  dark: 'dark',
  am: 'dark',
  ám: 'dark',
  wind: 'wind',
  phong: 'wind',
  neutral: 'neutral',
  vohe: 'neutral',
  'vo-he': 'neutral',
  vo: 'neutral',
  none: 'neutral',
};

const CLASS_NAME_MAP = {
  mage: 'Mage',
  tanker: 'Tanker',
  ranger: 'Ranger',
  archer: 'Ranger',
  warrior: 'Warrior',
  summoner: 'Summoner',
  support: 'Support',
  assassin: 'Assassin',
} as const;

export type CanonicalClassName = typeof CLASS_NAME_MAP[keyof typeof CLASS_NAME_MAP];

const normalizeText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

export function normalizeElementKey(value: unknown): ElementKey | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  const alias = ELEMENT_ALIAS_MAP[normalized];
  if (alias) return alias;
  return ELEMENT_KEY_SET.has(normalized) ? (normalized as ElementKey) : null;
}

export function normalizeElementList(values: unknown): ElementKey[] {
  if (!Array.isArray(values)) return [];
  const out: ElementKey[] = [];
  for (const item of values) {
    const key = normalizeElementKey(item);
    if (!key || out.includes(key)) continue;
    out.push(key);
  }
  return out;
}

export function normalizeClassName(value: unknown): CanonicalClassName | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return CLASS_NAME_MAP[normalized as keyof typeof CLASS_NAME_MAP] ?? null;
}
