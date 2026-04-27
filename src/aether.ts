//home (termux)/arclune_lane_7x3/src/aether.ts

import type { UnitToken, Side } from './types/units'; // Import type chuẩn

type AetherViewport = 'mobile' | 'desktop';

export interface AetherVisualOptions {
  facing?: 1 | -1;
  viewport?: AetherViewport;
  backOffsetX?: number;
  backOffsetY?: number;
  anchorLiftY?: number;
  clamp?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
}

export interface AetherVisualPairOptions {
  ally?: AetherVisualOptions;
  enemy?: AetherVisualOptions;
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const styleThresholdChanged = (prev: number | undefined, next: number, threshold = 0.25): boolean =>
  prev == null || Math.abs(prev - next) >= threshold;

export class SharedAetherPool {
  public max: number = 0;
  public current: number = 0;

  private uiFill: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private label: HTMLElement | null = null; // Thêm label hiển thị số
  private side: Side;
  private lastVisualState: {
    width: number;
    height: number;
    fontSize: number;
    labelBottom: number;
    left: number;
    top: number;
    opacity: string;
  } | null = null;
  private debugStyleWrites: number = 0;
  private debugSyncCalls: number = 0;

  constructor(side: Side) {
    this.side = side;
  }

private setCurrent(nextValue: number): boolean {
    const safeMax = Math.max(0, this.max);
    const next = clamp(nextValue, 0, safeMax);
    if (next === this.current) return false;
    this.current = next;
    return true;
  }

  // --- LOGIC VÒNG ĐỜI TRẬN ĐẤU ---
  private recalculateFromUnits(teamUnits: UnitToken[], resetCurrent: boolean = false): void {
      let nextMax = 0;
      for (const unit of teamUnits) {
          if (!unit || unit.side !== this.side || !unit.alive) continue; // Chỉ tính unit đang sống của phe mình
          nextMax += (unit.aeMax || 0);
      }

      this.max = Math.floor(nextMax);

      if (resetCurrent) {
        this.setCurrent(Math.floor(this.max / 2)); // Khởi đầu 50%
        return;
      }
      this.setCurrent(this.current);
  }

  public init(teamUnits: UnitToken[]) {
      this.recalculateFromUnits(teamUnits, true);
      this.initUI();
      this.updateUI();
  }

 public reconcile(teamUnits: UnitToken[]) {
      const prevMax = this.max;
      const prevCurrent = this.current;
      this.recalculateFromUnits(teamUnits, false);
      if (prevMax !== this.max || prevCurrent !== this.current) {
        this.updateUI();
      }
  }

  public gain(amount: number) {
      if (this.setCurrent(this.current + amount)) {
        this.updateUI();
      }
  }

  public consume(cost: number): boolean {
      if (this.current >= cost) {
          if (this.setCurrent(this.current - cost)) {
            this.updateUI();
          }
          return true;
      }
      return false;
  }

  public destroyUI() {
      if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      }
      this.container = null;
      this.uiFill = null;
      this.label = null;
      this.lastVisualState = null;
  }

  // --- LOGIC GIAO DIỆN ---
  public initUI() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = `aether-pool-${this.side}`;
    
    // Style động, sẽ được update vị trí bởi engine
    Object.assign(this.container.style, {
        position: 'fixed', 
        width: '12px',
        height: '0px',
        border: '1px solid rgba(255,255,255,0.6)',
        backgroundColor: 'rgba(10, 16, 26, 0.9)', 
        borderRadius: '2px',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column-reverse',
        zIndex: '100', // Đủ cao để đè lên nền, nhưng thấp hơn UI chính
        pointerEvents: 'none',
        transition: 'height 0.1s linear', 
        // QUAN TRỌNG: Dịch điểm neo về giữa chân đáy
        transform: 'translate(-50%, -100%)',
        boxShadow: `0 0 10px ${this.side === 'ally' ? '#00ffff' : '#ff3366'}` 
  });

    const color = this.side === 'ally' ? '#00ffff' : '#ff3366';
    this.container.style.boxShadow = `0 0 6px ${color}`;
    this.container.style.borderColor = color;

    // Gắn vào body (Overlay lên trên Canvas)
    document.body.appendChild(this.container);

    this.uiFill = document.createElement('div');
    Object.assign(this.uiFill.style, {
        width: '100%',
        height: '50%',
        backgroundColor: color,
        transition: 'height 0.2s ease-out',
        opacity: '0.9'
    });
    this.container.appendChild(this.uiFill);

    this.label = document.createElement('div');
    Object.assign(this.label.style, {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        bottom: '-20px',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 'bold',
        textShadow: '1px 1px 2px #000',
        pointerEvents: 'none'
    });
    this.container.appendChild(this.label);
  }

  public updateUI() {
    if (!this.uiFill || !this.container) return;
    const percent = this.max > 0 ? (this.current / this.max) * 100 : 0;
    this.uiFill.style.height = `${clamp(percent, 0, 100)}%`;
    if (this.label) {
        this.label.textContent = `${Math.floor(this.current)}`;
    }
  }

  // Hàm này được gọi từ Game Loop (draw) để bám theo nhân vật/vị trí
 public syncVisuals(screenX: number, screenY: number, scale: number, options: AetherVisualOptions = {}) {
    if (!this.container) return;
    this.debugSyncCalls += 1;
    
    if (scale < 0.1) {
        if (this.lastVisualState?.opacity !== '0') this.container.style.opacity = '0';
        this.lastVisualState = {
          ...(this.lastVisualState || { width: 0, height: 0, fontSize: 0, labelBottom: 0, left: 0, top: 0 }),
          opacity: '0'
        };
        return;
    }
    if (this.lastVisualState?.opacity !== '1') this.container.style.opacity = '1';

    // Tính kích thước theo scale
    const currentW = Math.max(10, 14 * scale);
    const currentH = Math.max(40, 130 * scale);

    if (styleThresholdChanged(this.lastVisualState?.width, currentW)) {
      this.container.style.width = `${currentW}px`;
    }
    if (styleThresholdChanged(this.lastVisualState?.height, currentH)) {
      this.container.style.height = `${currentH}px`;
    }
    
    // Scale chữ số
    const fontSize = Math.max(10, 14 * scale);
    const labelBottom = -fontSize * 1.5;
    if (this.label) {
        if (styleThresholdChanged(this.lastVisualState?.fontSize, fontSize)) {
          this.label.style.fontSize = `${fontSize}px`;
        }
        if (styleThresholdChanged(this.lastVisualState?.labelBottom, labelBottom)) {
          this.label.style.bottom = `${labelBottom}px`;
        }
    }

   const viewport: AetherViewport = options.viewport
      ?? ((typeof window !== 'undefined' && window.innerWidth <= 820) ? 'mobile' : 'desktop');
    const facing = options.facing ?? (this.side === 'ally' ? 1 : -1);

    const defaultBackX = (viewport === 'mobile' ? 18 : 24) * scale;
    const defaultBackY = (viewport === 'mobile' ? 24 : 30) * scale;
    const extraAnchorLift = Number.isFinite(options.anchorLiftY)
      ? (options.anchorLiftY as number)
      : 0;

    const backOffsetX = Number.isFinite(options.backOffsetX)
      ? (options.backOffsetX as number)
      : defaultBackX;
    const backOffsetY = Number.isFinite(options.backOffsetY)
      ? (options.backOffsetY as number)
      : defaultBackY;

     const facingSign = Math.sign(facing) || (this.side === 'ally' ? 1 : -1);
     const xOffset = -facingSign * backOffsetX;
     const yOffset = -(backOffsetY + extraAnchorLift);

    let nextLeft = screenX + xOffset;
    let nextTop = screenY + yOffset;

    const clampBounds = options.clamp;
      if (clampBounds) {
      if (Number.isFinite(clampBounds.minX)) nextLeft = Math.max(nextLeft, clampBounds.minX as number);
      if (Number.isFinite(clampBounds.maxX)) nextLeft = Math.min(nextLeft, clampBounds.maxX as number);
      if (Number.isFinite(clampBounds.minY)) nextTop = Math.max(nextTop, clampBounds.minY as number);
      if (Number.isFinite(clampBounds.maxY)) nextTop = Math.min(nextTop, clampBounds.maxY as number);
    }

    // Áp dụng toạ độ (đã có transform handle việc căn giữa)
    if (styleThresholdChanged(this.lastVisualState?.left, nextLeft)) {
      this.container.style.left = `${nextLeft}px`;
      this.debugStyleWrites += 1;
    }
    if (styleThresholdChanged(this.lastVisualState?.top, nextTop)) {
      this.container.style.top = `${nextTop}px`;
      this.debugStyleWrites += 1;
    }

    this.lastVisualState = {
      width: currentW,
      height: currentH,
      fontSize,
      labelBottom,
      left: nextLeft,
      top: nextTop,
      opacity: '1',
   };
  }

   public getDebugSnapshot() {
    return {
      side: this.side,
      syncCalls: this.debugSyncCalls,
      styleWrites: this.debugStyleWrites,
    };
  }

  public resetDebugSnapshot() {
    this.debugSyncCalls = 0;
    this.debugStyleWrites = 0;
  }
}

export const allyAetherPool = new SharedAetherPool('ally');
export const enemyAetherPool = new SharedAetherPool('enemy');

export const AE_ACTION_REGEN_BY_CLASS = {
  Support: 10,
  Mage: 7,
  Summoner: 7,
  Warrior: 5,
  Tanker: 5,
  Ranger: 5,
  Assassin: 3,
} as const;

export function resolveActionAetherRegen(className: string | null | undefined): number {
  if (!className) return AE_ACTION_REGEN_BY_CLASS.Warrior;
  return AE_ACTION_REGEN_BY_CLASS[className as keyof typeof AE_ACTION_REGEN_BY_CLASS]
    ?? AE_ACTION_REGEN_BY_CLASS.Warrior;
}

export const globalAetherPool = {
  init: (units: UnitToken[]) => {
    allyAetherPool.destroyUI();
    enemyAetherPool.destroyUI();
    allyAetherPool.init(units);
    enemyAetherPool.init(units);
  },

  gain: (side: Side, amount: number) => {
    if (side === 'ally') allyAetherPool.gain(amount);
    else if (side === 'enemy') enemyAetherPool.gain(amount);
  },

  consume: (side: Side, cost: number) => {
    if (side === 'ally') return allyAetherPool.consume(cost);
    return enemyAetherPool.consume(cost);
  },

current: (side: Side) => (side === 'ally' ? allyAetherPool.current : enemyAetherPool.current),

  // API cho Engine update vị trí
  syncAllVisuals: (
    allyPos: {x:number, y:number, s:number},
    enemyPos: {x:number, y:number, s:number},
    units?: UnitToken[],
    options?: AetherVisualPairOptions
  ) => {
    if (Array.isArray(units)) {
      allyAetherPool.reconcile(units);
      enemyAetherPool.reconcile(units);
    }
    allyAetherPool.syncVisuals(allyPos.x, allyPos.y, allyPos.s, options?.ally);
    enemyAetherPool.syncVisuals(enemyPos.x, enemyPos.y, enemyPos.s, options?.enemy);
  },

  destroy: () => {
    allyAetherPool.destroyUI();
    enemyAetherPool.destroyUI();
  },

  debugSnapshot: () => ({
    ally: allyAetherPool.getDebugSnapshot(),
    enemy: enemyAetherPool.getDebugSnapshot(),
  }),

  resetDebugSnapshot: () => {
    allyAetherPool.resetDebugSnapshot();
    enemyAetherPool.resetDebugSnapshot();
  }
};
