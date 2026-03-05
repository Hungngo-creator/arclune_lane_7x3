const { __resolveStatusIconPreview } = require('../src/modes/pve/session-runtime');

describe('pve HUD status icon render rules', () => {
  it('giới hạn icon, ưu tiên control/debuff và tooltip ngắn', () => {
    const preview = __resolveStatusIconPreview([
      { id: 'bleed', kind: 'debuff', tag: 'dot', dur: 3, stacks: 2 },
      { id: 'stun', kind: 'debuff', tag: 'control', dur: 1 },
      { id: 'haste', kind: 'buff', tag: 'stat', dur: 2 },
      { id: 'me_hoac', kind: 'debuff', tag: 'control', dur: 2 },
      { id: 'shield', kind: 'buff', tag: 'shield' },
      { id: 'loithienanh_spd_burn', kind: 'debuff', tag: 'output', dur: 4 },
      { id: 'accuracy_down', kind: 'debuff', tag: 'output', dur: 2 },
    ]);

    expect(preview.length).toBe(5);
    expect(preview[0].id).toBe('me_hoac');
    expect(preview[1].id).toBe('stun');
    expect(preview.every((entry) => entry.tooltip.includes('·'))).toBe(true);
    expect(preview.some((entry) => entry.tooltip.includes('T'))).toBe(true);
    expect(preview).toMatchSnapshot();
  });
});
