declare module '@types/vfx' {
  export type * from '../src/types/vfx.ts';
}

declare module '@types/config' {
  export type { CatalogStatBlock, RosterUnitDefinition } from '../src/types/config.ts';
}

declare module '@types/units' {
  export type * from '../src/types/units.ts';
  export { createSummonQueue } from '../src/types/units.ts';
}

declare module 'zod' {
  export * from '../tools/zod-stub/index';
  const z: typeof import('../tools/zod-stub/index').z;
  export default z;;
}