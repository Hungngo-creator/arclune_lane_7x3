//home (termux)/arclune_lane_7x3/src/aether.ts

import { addGameEventListener, TURN_START, BATTLE_END } from './events.ts';
import { AE_CLASS_COEFF } from './catalog.ts';
import type { UnitToken, Side } from './types/units'; // Import type chuẩn

export class SharedAetherPool {
  public max: number = 0;
  public current: number = 0;
  public regenPerTurn: number = 0;

  private uiFill: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private label: HTMLElement | null = null; // Thêm label hiển thị số
  private side: Side;

  constructor(side: Side) {
    this.side = side;
  }

  // --- LOGIC VÒNG ĐỜI TRẬN ĐẤU ---
  private recalculateFromUnits(teamUnits: UnitToken[], resetCurrent: boolean = false): void {
      let nextMax = 0;
      let nextRegen = 0;
      for (const unit of teamUnits) {
          if (!unit || unit.side !== this.side || !unit.alive) continue; // Chỉ tính unit đang sống của phe mình
          nextMax += (unit.aeMax || 0);
          
          // Lấy hệ số class, fallback về 0.55 nếu không có
          const className = (unit as any).class || 'Warrior';
          const coeff = AE_CLASS_COEFF[className as keyof typeof AE_CLASS_COEFF] ?? 0.55;

          nextRegen += ((unit.wil || 0) * coeff);
      }

      this.max = Math.floor(nextMax);
      this.regenPerTurn = Math.floor(nextRegen);

      if (resetCurrent) {
        this.current = Math.floor(this.max / 2); // Khởi đầu 50%
        return;
      }

      if (this.current > this.max) {
        this.current = this.max;
      }
      if (this.current < 0) {
        this.current = 0;
      }
  }

  public init(teamUnits: UnitToken[]) {
      this.recalculateFromUnits(teamUnits, true);
      this.initUI();
      this.updateUI();
  }

public reconcile(teamUnits: UnitToken[]) {
      const prevMax = this.max;
      const prevRegen = this.regenPerTurn;
      const prevCurrent = this.current;
      this.recalculateFromUnits(teamUnits, false);
      if (prevMax !== this.max || prevRegen !== this.regenPerTurn || prevCurrent !== this.current) {
        this.updateUI();
      }
  }

  // Gọi khi kết thúc 1 Turn Lớn (Cycle)
  public onTurnCycleEnd() {
      this.gain(this.regenPerTurn);
  }

  public gain(amount: number) {
      this.current += amount;
      if (this.current > this.max) {
          this.current = this.max;
      }
      this.updateUI();
  }

  public consume(cost: number): boolean {
      if (this.current >= cost) {
          this.current -= cost;
          this.updateUI();
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
    this.uiFill.style.height = `${Math.max(0, Math.min(100, percent))}%`;
    if (this.label) {
        this.label.textContent = `${Math.floor(this.current)}`;
    }
  }

  // Hàm này được gọi từ Game Loop (draw) để bám theo nhân vật/vị trí
public syncVisuals(screenX: number, screenY: number, scale: number) {
    if (!this.container) return;
    
    if (scale < 0.1) {
        this.container.style.opacity = '0';
        return;
    }
    this.container.style.opacity = '1';

    // Tính kích thước theo scale
    const currentW = Math.max(10, 14 * scale);
    const currentH = Math.max(40, 130 * scale);

    this.container.style.width = `${currentW}px`;
    this.container.style.height = `${currentH}px`;
    
    // Scale chữ số
    if (this.label) {
        const fontSize = Math.max(10, 14 * scale);
        this.label.style.fontSize = `${fontSize}px`;
        this.label.style.bottom = `${-fontSize * 1.5}px`;
    }

    // Offset giả lập 3D: Đẩy trụ ra sau lưng Leader
    // Ally (Trái): Lùi thêm sang trái (-X)
    // Enemy (Phải): Tiến thêm sang phải (+X)
    // Cả 2 đều nhích lên trên (-Y) để khớp chân
    const xOffset = this.side === 'ally' ? -18 * scale : 18 * scale; 
    const yOffset = -34 * scale;

    // Áp dụng toạ độ (đã có transform handle việc căn giữa)
    this.container.style.left = `${screenX + xOffset}px`;
    this.container.style.top = `${screenY + yOffset}px`; 
 }
}

export const allyAetherPool = new SharedAetherPool('ally');
export const enemyAetherPool = new SharedAetherPool('enemy');

export const globalAetherPool = {
  init: (units: UnitToken[]) => {
    allyAetherPool.destroyUI();
    enemyAetherPool.destroyUI();
    allyAetherPool.init(units);
    enemyAetherPool.init(units);
  },
  
  onTurnCycleEnd: () => {
    allyAetherPool.onTurnCycleEnd();
    enemyAetherPool.onTurnCycleEnd();
  },

  gain: (side: Side, amount: number) => {
    if (side === 'ally') allyAetherPool.gain(amount);
    else if (side === 'enemy') enemyAetherPool.gain(amount);
  },

  consume: (side: Side, cost: number) => {
    if (side === 'ally') return allyAetherPool.consume(cost);
    return enemyAetherPool.consume(cost);
  },

  // API cho Engine update vị trí
  syncAllVisuals: (
    allyPos: {x:number, y:number, s:number},
    enemyPos: {x:number, y:number, s:number},
    units?: UnitToken[]
  ) => {
    if (Array.isArray(units)) {
      allyAetherPool.reconcile(units);
      enemyAetherPool.reconcile(units);
    }
    allyAetherPool.syncVisuals(allyPos.x, allyPos.y, allyPos.s);
    enemyAetherPool.syncVisuals(enemyPos.x, enemyPos.y, enemyPos.s);
  },

  destroy: () => {
    allyAetherPool.destroyUI();
    enemyAetherPool.destroyUI();
  }
};

