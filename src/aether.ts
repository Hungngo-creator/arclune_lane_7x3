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
  public init(teamUnits: UnitToken[]) {
      this.max = 0;
      this.regenPerTurn = 0;
      for (const unit of teamUnits) {
          if (!unit || unit.side !== this.side) continue; // Chỉ tính unit phe mình
          this.max += (unit.aeMax || 0);
          
          // Lấy hệ số class, fallback về 0.55 nếu không có
          const className = (unit as any).class || 'Warrior'; 
          const coeff = AE_CLASS_COEFF[className as keyof typeof AE_CLASS_COEFF] ?? 0.55;
          
          this.regenPerTurn += ((unit.wil || 0) * coeff);
      }
      this.max = Math.floor(this.max);
      this.regenPerTurn = Math.floor(this.regenPerTurn);
      
      this.current = Math.floor(this.max / 2); // Khởi đầu 50%
      
      this.initUI();
      this.updateUI();
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
        width: '14px', 
        height: '0px',
        border: '1px solid rgba(255,255,255,0.5)',
        backgroundColor: 'rgba(9, 14, 21, 0.85)', // Màu nền tối hơn để nổi bật
        borderRadius: '3px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column-reverse',
        zIndex: '9999', // Đẩy lên trên cùng mọi lớp Canvas/UI
        pointerEvents: 'none',
        transition: 'opacity 0.1s',
        transformOrigin: 'bottom center',
        boxShadow: `0 0 15px ${this.side === 'ally' ? '#00ffff' : '#ff3366'}` 
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
    
    // Bỏ qua điều kiện ẩn âm toạ độ, chỉ ẩn khi zoom quá bé
    if (scale < 0.1) {
        this.container.style.display = 'none';
        return;
    }
    this.container.style.display = 'flex';
    this.container.style.opacity = '1';

    const w = Math.max(8, 16 * scale); 
    const h = Math.max(40, 120 * scale);

    this.container.style.width = `${w}px`;
    this.container.style.height = `${h}px`;
    
    if (this.label) {
        this.label.style.fontSize = `${Math.max(9, 12 * scale)}px`;
        this.label.style.bottom = `${-22 * scale}px`;
    }

    // Offset để lùi về phía sau và sang hai bên
    const sideOffset = this.side === 'ally' ? -35 : 35; 
    const heightOffset = -20; 

    const finalX = screenX + (sideOffset * scale) - (w / 2);
    const finalY = screenY + (heightOffset * scale) - h;

    this.container.style.left = `${finalX}px`;
    this.container.style.top = `${finalY}px`; 
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
  syncAllVisuals: (allyPos: {x:number, y:number, s:number}, enemyPos: {x:number, y:number, s:number}) => {
    allyAetherPool.syncVisuals(allyPos.x, allyPos.y, allyPos.s);
    enemyAetherPool.syncVisuals(enemyPos.x, enemyPos.y, enemyPos.s);
  },

  destroy: () => {
    allyAetherPool.destroyUI();
    enemyAetherPool.destroyUI();
  }
};

