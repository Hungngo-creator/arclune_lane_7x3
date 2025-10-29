const objectProto = Object.prototype;

const ZodIssueCode = Object.freeze({
  custom: 'custom'
});

class ZodError extends TypeError {
  constructor(issues) {
    const firstIssue = issues[0];
    const message = formatIssueMessage(firstIssue);
    super(message);
    this.name = 'ZodError';
    this.issues = issues.map((issue) => ({ ...issue, path: [...issue.path] }));
  }
}

function formatIssueMessage(issue) {
  if (!issue) {
    return 'Invalid input';
  }
  const pathSegment = Array.isArray(issue.path) && issue.path.length > 0 ? ` at ${issue.path.join('.')}` : '';
  return typeof issue.message === 'string' && issue.message.length > 0
    ? `${issue.message}${pathSegment}`
    : `Invalid input${pathSegment}`;
}

function normalizeIssue(issue) {
  if (!issue || typeof issue !== 'object') {
    throw new TypeError('Issue must be an object');
  }
  const normalized = { ...issue };
  normalized.path = Array.isArray(normalized.path) ? [...normalized.path] : [];
  normalized.code = normalized.code ?? ZodIssueCode.custom;
  normalized.message = typeof normalized.message === 'string' && normalized.message.length > 0
    ? normalized.message
    : 'Invalid input';
  return normalized;
}

function createZodError(issues) {
  const normalizedIssues = issues.map((issue) => normalizeIssue(issue));
  return new ZodError(normalizedIssues);
}

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

class ZodUnion extends ZodType {
  constructor(options) {
    super();
    if (!Array.isArray(options) || options.length === 0) {
      throw new TypeError('ZodUnion requires a non-empty array of options');
    }
    this.options = [...options];
  }

  _parse(value) {
    let lastError;
    for (const option of this.options) {
      try {
        return option.parse(value);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }
    if (lastError) {
      throw lastError;
    }
    throw new TypeError('Invalid union: no options matched');
  }
}

class ZodTuple extends ZodType {
  constructor(items) {
    super();
    if (!Array.isArray(items)) {
      throw new TypeError('ZodTuple requires an array of items');
    }
    this.items = [...items];
  }

  _parse(value) {
    if (!Array.isArray(value)) {
      throw new TypeError('Expected array for tuple');
    }
    if (value.length !== this.items.length) {
      throw new TypeError(`Expected tuple of length ${this.items.length}`);
    }
    const result = new Array(this.items.length);
    for (let index = 0; index < this.items.length; index += 1) {
      result[index] = this.items[index].parse(value[index]);
    }
    return result;
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
  constructor(shape, refiners = []) {
    super();
    this.shape = { ...shape };
    this.refiners = [...refiners];
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
    if (this.refiners.length > 0) {
      const issues = [];
      const ctx = {
        addIssue: (issue) => {
          issues.push(issue);
        },
        path: [],
        data: result
      };
      for (const refiner of this.refiners) {
        refiner(result, ctx);
      }
      if (issues.length > 0) {
        throw createZodError(issues);
      }
    }
    return result;
  }

  merge(other) {
    if (!(other instanceof ZodObject)) {
      throw new TypeError('ZodObject.merge expects another ZodObject');
    }
    return new ZodObject({ ...this.shape, ...other.shape }, [...this.refiners, ...other.refiners]);
  }

  superRefine(refiner) {
    if (typeof refiner !== 'function') {
      throw new TypeError('ZodObject.superRefine expects a function');
    }
    return new ZodObject(this.shape, [...this.refiners, refiner]);
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
  record: (schema) => new ZodRecord(schema),
  union: (schemas) => new ZodUnion(schemas),
  tuple: (schemas) => new ZodTuple(schemas),
  ZodIssueCode,
  ZodError,
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
  ZodUnion,
  ZodTuple,
  ZodRecord,
  ZodObject,
  ZodIssueCode,
  ZodError
};

export default z;