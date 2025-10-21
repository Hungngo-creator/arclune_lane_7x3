type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type Builtin = Primitive | Date | RegExp | Function | Error | Promise<unknown>;

export type ValueOf<T> = T[keyof T];

export type ReadonlyDeep<T> = T extends Builtin
  ? T
  : T extends Map<infer K, infer V>
    ? ReadonlyMap<ReadonlyDeep<K>, ReadonlyDeep<V>>
    : T extends Set<infer M>
      ? ReadonlySet<ReadonlyDeep<M>>
      : T extends Array<infer U>
        ? ReadonlyArray<ReadonlyDeep<U>>
        : T extends object
          ? { readonly [P in keyof T]: ReadonlyDeep<T[P]> }
          : T;

export type MaybeArray<T> = T | T[];

export type Nullable<T> = T | null;

export type Undefinable<T> = T | undefined;

export type NonEmptyArray<T> = [T, ...T[]];

export type MaybePromise<T> = T | Promise<T>;