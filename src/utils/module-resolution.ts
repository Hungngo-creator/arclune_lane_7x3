export type AnyFunction = (...args: any[]) => unknown;

export function pickFunctionFromSource<TFn extends AnyFunction>(
  source: unknown,
  preferredKeys: ReadonlyArray<string> = [],
  fallbackKeys: ReadonlyArray<string> = []
): TFn | null {
  if (!source) return null;

  if (typeof source === 'function'){
    return source as TFn;
  }

  if (source && typeof source === 'object'){
    const record = source as Record<string, unknown>;
    for (const key of preferredKeys){
      const value = record[key];
      if (typeof value === 'function'){
        return value as TFn;
      }
    }
    for (const key of fallbackKeys){
      const value = record[key];
      if (typeof value === 'function'){
        return value as TFn;
      }
    }
  }

  return null;
}

export function resolveModuleFunction<TFn extends AnyFunction>(
  module: unknown,
  preferredKeys: ReadonlyArray<string> = [],
  fallbackKeys: ReadonlyArray<string> = []
): TFn | null {
  const candidate = pickFunctionFromSource<TFn>(module, preferredKeys, fallbackKeys);
  return typeof candidate === 'function' ? candidate : null;
}
