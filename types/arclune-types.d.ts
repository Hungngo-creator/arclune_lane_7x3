declare module '@shared-types/vfx' {
  export * from '../src/types/vfx.ts';
}

declare module '@shared-types/config' {
  export * from '../src/types/config.ts';
}

declare module '@shared-types/units' {
  export * from '../src/types/units.ts';
}

declare module 'zod' {
  export * from '../tools/zod-stub/index';
  const z: typeof import('../tools/zod-stub/index').z;
  export default z;
}