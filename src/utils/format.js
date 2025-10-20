// @ts-check

/**
 * @typedef {number | string | { toLocaleString?: (locale?: string | string[], options?: Intl.NumberFormatOptions) => string }} NumberFormatInput
 */

/**
 * @typedef {{ format(value: NumberFormatInput | null | undefined): string }} PolyfillNumberFormatter
 */

const HAS_INTL_NUMBER_FORMAT = typeof Intl === 'object' && typeof Intl.NumberFormat === 'function';

/**
 * @param {string | string[] | undefined} locale
 * @param {Intl.NumberFormatOptions | undefined} options
 * @returns {Intl.NumberFormat | PolyfillNumberFormatter}
 */
function createNumberFormatter(locale, options){
  if (HAS_INTL_NUMBER_FORMAT){
    return new Intl.NumberFormat(locale, options);
  }

  const hasLocaleString = typeof Number.prototype.toLocaleString === 'function';

  return {
    /**
     * @param {NumberFormatInput | null | undefined} value
     * @returns {string}
     */
    format(value){
      if (typeof value === 'number'){
        if (hasLocaleString){
          try {
            return value.toLocaleString();
          } catch (error) {
            return String(value);
          }
        }
        return String(value);
      }

      if (value == null){
        return '';
      }

      if (hasLocaleString && typeof value?.toLocaleString === 'function'){
        try {
          return value.toLocaleString();
        } catch (error) {
          return String(value);
        }
      }

      return String(value);
    }
  };
}

export {
  HAS_INTL_NUMBER_FORMAT,
  createNumberFormatter
};