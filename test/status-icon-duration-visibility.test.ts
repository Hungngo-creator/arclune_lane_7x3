import { Statuses } from '../src/statuses.ts';
import { __resolveStatusIconPreview } from '../src/modes/pve/session-runtime-impl.ts';

describe('status icon duration visibility', () => {
  it('shows icon while duration is active and hides after expiry', () => {
    const unit = {
      id: 'status_unit',
      iid: 1,
      side: 'ally',
      cx: 0,
      cy: 0,
      alive: true,
      hp: 100,
      hpMax: 100,
      statuses: [],
    };

    Statuses.add(unit as never, Statuses.make.silence({ turns: 1 }));
    const before = __resolveStatusIconPreview(unit.statuses as never);
    expect(before.some((entry) => entry.id === 'silence')).toBe(true);

    Statuses.onTurnEnd(unit as never, {});
    const after = __resolveStatusIconPreview(unit.statuses as never);
    expect(after.some((entry) => entry.id === 'silence')).toBe(false);
  });
});
