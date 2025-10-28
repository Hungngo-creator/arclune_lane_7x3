export type ZodTypeAny = ZodType<any>;
export type ZodRawShape = { [key: string]: ZodTypeAny };

declare type OutputOf<T extends ZodTypeAny> = T extends ZodType<infer Output> ? Output : never;

export class ZodType<Output> {
  protected _output!: Output;
  parse(value: unknown): Output;
  optional(): ZodOptional<Output>;
}

export class ZodOptional<Output> extends ZodType<Output | undefined> {
  constructor(inner: ZodType<Output>);
}

export class ZodString extends ZodType<string> {}

export class ZodNumber extends ZodType<number> {}

export class ZodBoolean extends ZodType<boolean> {}

export class ZodLiteral<Value extends string | number | boolean> extends ZodType<Value> {
  constructor(value: Value);
}

export class ZodEnum<Values extends [string, ...string[]]> extends ZodType<Values[number]> {
  constructor(values: Values);
}

export class ZodArray<Item extends ZodTypeAny> extends ZodType<Array<OutputOf<Item>>> {
  constructor(item: Item);
}

export class ZodUnion<Options extends [ZodTypeAny, ...ZodTypeAny[]]> extends ZodType<OutputOf<Options[number]>> {
  constructor(options: Options);
}

export class ZodTuple<Items extends readonly ZodTypeAny[]> extends ZodType<{ [K in keyof Items]: Items[K] extends ZodTypeAny ? OutputOf<Items[K]> : never }> {
  constructor(items: Items);
}

export class ZodRecord<Value extends ZodTypeAny> extends ZodType<Record<string, OutputOf<Value>>> {
  constructor(value: Value);
}

export class ZodObject<Shape extends ZodRawShape> extends ZodType<{ [K in keyof Shape]: OutputOf<Shape[K]> }> {
  readonly shape: Shape;
  constructor(shape: Shape);
  merge<OtherShape extends ZodRawShape>(other: ZodObject<OtherShape>): ZodObject<Shape & OtherShape>;
}

export const z: {
  string(): ZodString;
  number(): ZodNumber;
  boolean(): ZodBoolean;
  literal<Value extends string | number | boolean>(value: Value): ZodLiteral<Value>;
  enum<Values extends [string, ...string[]]>(values: Values): ZodEnum<Values>;
  object<Shape extends ZodRawShape>(shape: Shape): ZodObject<Shape>;
  array<Item extends ZodTypeAny>(schema: Item): ZodArray<Item>;
  record<Value extends ZodTypeAny>(schema: Value): ZodRecord<Value>;
  union<Options extends [ZodTypeAny, ...ZodTypeAny[]]>(schemas: Options): ZodUnion<Options>;
  tuple<Items extends readonly ZodTypeAny[]>(schemas: Items): ZodTuple<Items>;
};

export type infer<T extends ZodTypeAny> = T extends ZodType<infer Output> ? Output : never;

export namespace z {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export type infer<T extends ZodTypeAny> = T extends ZodType<infer Output> ? Output : never;
}

export default z;