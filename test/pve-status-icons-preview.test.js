const fs = require('fs');
const path = require('path');

describe('pve HUD status icon render rules', () => {
  it('định nghĩa giới hạn icon, ưu tiên control debuff và tooltip', () => {
    const runtimePath = path.join(__dirname, '..', 'src', 'modes', 'pve', 'session-runtime-impl.ts');
    const source = fs.readFileSync(runtimePath, 'utf8');

    expect(source).toContain('const MAX_STATUS_ICONS_PER_TOKEN = 5;');
    expect(source).toContain("const CONTROL_TAGS = new Set(['control', 'silence', 'taunt', 'stun', 'sleep', 'fear']);");
    expect(source).toContain("return `${label} ${stacksText} · ${turnsText}`;");
    expect(source).toContain('return icons.slice(0, MAX_STATUS_ICONS_PER_TOKEN);');
    expect(source).toContain('addGameEventListener(eventType, () => {');
    expect(source).toContain("[TURN_START, TURN_END].forEach((eventType) => {");
  });
});
