const HAS_INTL_NUMBER_FORMAT = typeof Intl === 'object' && typeof Intl.NumberFormat === 'function';

type LocaleValue = string | string[];

type NumberFormatInput =
  | number
  | string
  | {
      toLocaleString?: (locale?: LocaleValue, options?: Intl.NumberFormatOptions) => string;
    };

interface PolyfillNumberFormatter {
  format(value: NumberFormatInput | null | undefined): string;
}

type NumberFormatter = Intl.NumberFormat | PolyfillNumberFormatter;

export function createNumberFormatter(
  locale?: LocaleValue,
  options?: Intl.NumberFormatOptions
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