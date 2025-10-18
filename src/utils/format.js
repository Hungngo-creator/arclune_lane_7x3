const HAS_INTL_NUMBER_FORMAT = typeof Intl === 'object' && typeof Intl.NumberFormat === 'function';

function createNumberFormatter(locale, options){
  if (HAS_INTL_NUMBER_FORMAT){
    return new Intl.NumberFormat(locale, options);
  }

  const hasLocaleString = typeof Number.prototype.toLocaleString === 'function';

  return {
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
