import { resolveModuleFunction } from '../src/utils/module-resolution.ts';

describe('resolveModuleFunction', () => {
  test('lấy được createPveSession từ module PvE', async () => {
    const module = await import('../src/modes/pve/session.ts');
    const createPveSession = resolveModuleFunction<(typeof module)['createPveSession']>(
      module,
      ['createPveSession']
    );
    expect(typeof createPveSession).toBe('function');
    expect(createPveSession).toBe(module.createPveSession);
  });

  test('lấy được renderer màn bộ sưu tập', async () => {
    const module = await import('../src/screens/collection/index.ts');
    const renderCollectionScreen = resolveModuleFunction<(typeof module)['renderCollectionScreen']>(
      module,
      ['renderCollectionScreen', 'renderScreen'],
      ['render']
    );
    expect(typeof renderCollectionScreen).toBe('function');
    expect(renderCollectionScreen).toBe(module.renderCollectionScreen);
  });

  test('lấy được renderer màn đội hình', async () => {
    const module = await import('../src/screens/lineup/index.ts');
    const renderLineupScreen = resolveModuleFunction<(typeof module)['renderLineupScreen']>(
      module,
      ['renderLineupScreen']
    );
    expect(typeof renderLineupScreen).toBe('function');
    expect(renderLineupScreen).toBe(module.renderLineupScreen);
  });
});
