const objectProto = Object.prototype;

class ZodType {
  optional() {
    return new ZodOptional(this);
  }

  parse(value) {
    return this._parse(value);
  }

  // eslint-disable-next-line class-methods-use-this
  _parse() {
    throw new TypeError('ZodType subclasses must implement _parse');
  }
}

class ZodOptional extends ZodType {
  constructor(inner) {
    super();
    this.inner = inner;
  }

  _parse(value) {
    if (value === undefined) {
      return undefined;
    }
    return this.inner.parse(value);
  }
}

class ZodString extends ZodType {
  _parse(value) {
    if (typeof value !== 'string') {
      throw new TypeError('Expected string');
    }
    return value;
  }
}

class ZodNumber extends ZodType {
  _parse(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new TypeError('Expected number');
    }
    return value;
  }
}

class ZodBoolean extends ZodType {
  _parse(value) {
    if (typeof value !== 'boolean') {
      throw new TypeError('Expected boolean');
    }
    return value;
  }
}

class ZodLiteral extends ZodType {
  constructor(expected) {
    super();
    this.expected = expected;
  }

  _parse(value) {
    if (value !== this.expected) {
      throw new TypeError(`Expected literal ${String(this.expected)}`);
    }
    return value;
  }
}

class ZodEnum extends ZodType {
  constructor(values) {
    super();
    if (!Array.isArray(values) || values.length === 0) {
      throw new TypeError('ZodEnum requires a non-empty array of values');
    }
    this.values = [...values];
    this.valueSet = new Set(this.values);
  }

  _parse(value) {
    if (typeof value !== 'string' || !this.valueSet.has(value)) {
      throw new TypeError(`Expected one of: ${this.values.join(', ')}`);
    }
    return value;
  }
}

class ZodArray extends ZodType {
  constructor(itemSchema) {
    super();
    this.itemSchema = itemSchema;
  }

  _parse(value) {
    if (!Array.isArray(value)) {
      throw new TypeError('Expected array');
    }
    return value.map((item) => this.itemSchema.parse(item));
  }
}

class ZodRecord extends ZodType {
  constructor(valueSchema) {
    super();
    this.valueSchema = valueSchema;
  }

  _parse(value) {
    if (!isPlainObject(value)) {
      throw new TypeError('Expected object for record');
    }
    const result = {};
    for (const key of Object.keys(value)) {
      result[key] = this.valueSchema.parse(value[key]);
    }
    return result;
  }
}

class ZodObject extends ZodType {
  constructor(shape) {
    super();
    this.shape = { ...shape };
  }

  _parse(value) {
    if (!isPlainObject(value)) {
      throw new TypeError('Expected object');
    }
    const result = { ...value };
    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key];
      const hasKey = objectProto.hasOwnProperty.call(value, key);
      const fieldValue = hasKey ? value[key] : undefined;
      if (!hasKey && !(schema instanceof ZodOptional)) {
        throw new TypeError(`Missing required key "${key}"`);
      }
      result[key] = schema.parse(fieldValue);
    }
    return result;
  }

  merge(other) {
    if (!(other instanceof ZodObject)) {
      throw new TypeError('ZodObject.merge expects another ZodObject');
    }
    return new ZodObject({ ...this.shape, ...other.shape });
  }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const z = {
  string: () => new ZodString(),
  number: () => new ZodNumber(),
  boolean: () => new ZodBoolean(),
  literal: (value) => new ZodLiteral(value),
  enum: (values) => new ZodEnum(values),
  object: (shape) => new ZodObject(shape),
  array: (schema) => new ZodArray(schema),
  record: (schema) => new ZodRecord(schema)
};

export {
  ZodType,
  ZodOptional,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodLiteral,
  ZodEnum,
  ZodArray,
  ZodRecord,
  ZodObject
};

export default z;
