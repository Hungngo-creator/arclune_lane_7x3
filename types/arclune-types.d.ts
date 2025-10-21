declare module '@types/vfx' {
  export type * from '../src/types/vfx';
}

declare module 'zod' {
  export * from '../tools/zod-stub/index';
  const z: typeof import('../tools/zod-stub/index').z;
  export default z;;
}