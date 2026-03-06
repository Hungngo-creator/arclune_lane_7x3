//home (termux)/arclune_lane_7x3/src/utils/format.ts
const HAS_INTL_NUMBER_FORMAT = typeof Intl === 'object' && typeof Intl.NumberFormat === 'function';

export type LocaleValue = string | string[];

export type NumberFormatOptions = Intl.NumberFormatOptions;

type NumberFormatInput =
  | number
  | string
  | {
      toLocaleString?: (locale?: LocaleValue, options?: Intl.NumberFormatOptions) => string;
    };

interface PolyfillNumberFormatter {
  format(value: NumberFormatInput | null | undefined): string;
}

export type NumberFormatter = Intl.NumberFormat | PolyfillNumberFormatter;

export function stableStringify(value: unknown, seen: WeakSet<object> = new WeakSet()): string {
  if (value === null) return 'null';
  const type = typeof value;
  if (type === 'undefined') return 'undefined';
  if (type === 'number' || type === 'boolean' || type === 'bigint') return String(value);
  if (type === 'string') return JSON.stringify(value);
  if (type === 'symbol') return (value as symbol).toString();
  if (type === 'function') return `[Function:${(value as { name?: string }).name || 'anonymous'}]`;
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry, seen)).join(',')}]`;
  }
  if (type === 'object') {
    const objectValue = value as Record<string | number | symbol, unknown>;
    if (seen.has(objectValue)) return '"[Circular]"';
    seen.add(objectValue);
    const keys = Object.keys(objectValue).sort();
    const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key], seen)}`);
    seen.delete(objectValue);
    return `{${entries.join(',')}}`;
  }
  return String(value);
}

export function createNumberFormatter(
  locale?: LocaleValue,
  options?: NumberFormatOptions
): NumberFormatter {
  if (HAS_INTL_NUMBER_FORMAT) {
    return new Intl.NumberFormat(locale, options);
  }

  const hasLocaleString = typeof Number.prototype.toLocaleString === 'function';

  return {
    format(value) {
      if (typeof value === 'number') {
        if (hasLocaleString) {
          try {
            return value.toLocaleString();
          } catch (error) {
            return String(value);
          }
        }
        return String(value);
      }

      if (value == null) {
        return '';
      }

      if (hasLocaleString && typeof value?.toLocaleString === 'function') {
        try {
          return value.toLocaleString();
        } catch (error) {
          return String(value);
        }
      }

      return String(value);
    }
  } satisfies PolyfillNumberFormatter;
}

export { HAS_INTL_NUMBER_FORMAT };