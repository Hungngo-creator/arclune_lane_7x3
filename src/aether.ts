import { addGameEventListener, TURN_START, BATTLE_END } from './events.ts';
import { AE_CLASS_COEFF } from './catalog.ts';

export class SharedAetherPool {
  public max: number = 0;
  public current: number = 0;
  public regenPerTurn: number = 0;

  private uiFill: HTMLElement | null = null;
  private container: HTMLElement | null = null; // Biến lưu DOM để đập bỏ khi hết trận
  private side: 'ally' | 'enemy';

  constructor(side: 'ally' | 'enemy') {
    this.side = side;
    // BỎ HẲN ĐOẠN AUTO INIT Ở ĐÂY. KHÔNG VÀO TRẬN THÌ KHÔNG VẼ!
  }

  // --- LOGIC VÒNG ĐỜI TRẬN ĐẤU ---
  public init(teamUnits: any[]) {
      this.max = 0;
      this.regenPerTurn = 0;
      for (const unit of teamUnits) {
          if (!unit) continue;
          this.max += (unit.aeMax || 0);
          const coeff = AE_CLASS_COEFF[unit.className as keyof typeof AE_CLASS_COEFF] || 0.55;
          this.regenPerTurn += ((unit.wil || 0) * coeff);
      }
      this.current = Math.floor(this.max / 2);
      this.regenPerTurn = Math.floor(this.regenPerTurn);
      
      // CHỈ VẼ UI KHI HÀM INIT (VÀO TRẬN) ĐƯỢC GỌI
      this.initUI();
      this.updateUI();
  }

  public onTurnEnd() {
      this.current += this.regenPerTurn;
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

  // HÀM MỚI: ĐẬP BỎ TRỤ KHI HẾT TRẬN / THOÁT RA MAIN MENU
  public destroyUI() {
      if (this.container && this.container.parentNode) {
          this.container.parentNode.removeChild(this.container);
      }
      this.container = null;
      this.uiFill = null;
  }

  // --- LOGIC GIAO DIỆN (NÂNG CẤP) ---
  public initUI() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = `aether-pool-${this.side}`;
    this.container.style.position = 'absolute';
    this.container.style.width = '30px';
    this.container.style.height = '200px';
    this.container.style.border = '2px solid #ccc';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.container.style.borderRadius = '15px';
    this.container.style.overflow = 'hidden';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column-reverse';
    // Đẩy z-index lên để không bị sàn đấu đè
    this.container.style.zIndex = '10'; 
    // Giữ điểm neo chuẩn để zoom/out không bị lệch tâm
    this.container.style.transformOrigin = 'bottom center';

    if (this.side === 'ally') {
        // Tọa độ âm để đẩy nó lùi ra mép ngoài (sau lưng leader ô 8)
        this.container.style.bottom = '-60px'; 
        this.container.style.left = '-60px';   
        this.container.style.borderColor = '#00ffff';
        this.container.style.boxShadow = '0 0 10px #00ffff';
    } else {
        // Tương tự cho bên địch
        this.container.style.top = '-60px';    
        this.container.style.right = '-60px';  
        this.container.style.borderColor = '#ff00ff';
        this.container.style.boxShadow = '0 0 10px #ff00ff';
    }

    // FIX CỐT LÕI: Gắn vào Sàn đấu (#battlefield) thay vì document.body
    // Việc này ép 2 trụ Aether nằm chung chiều không gian, chịu chung Zoom/Pan với sàn.
    const battlefield = document.getElementById('battlefield');
    if (battlefield) {
        battlefield.appendChild(this.container);
    } else {
        // Fallback nhỡ sàn chưa render
        document.body.appendChild(this.container);
    }

    this.uiFill = document.createElement('div');
    this.uiFill.style.width = '100%';
    this.uiFill.style.backgroundColor = this.side === 'ally' ? '#00ffff' : '#ff00ff';
    this.uiFill.style.transition = 'height 0.3s ease';
    this.uiFill.style.height = '50%';
    this.container.appendChild(this.uiFill);

    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.width = '100%';
    label.style.textAlign = 'center';
    label.style.bottom = '5px';
    label.style.color = '#fff';
    label.style.fontWeight = 'bold';
    label.style.textShadow = '1px 1px 2px #000';
    label.id = `aether-label-${this.side}`;
    this.container.appendChild(label);
  }

  public updateUI() {
    if (!this.uiFill || !this.container) return;
    const percent = this.max > 0 ? (this.current / this.max) * 100 : 0;
    this.uiFill.style.height = `${Math.max(0, Math.min(100, percent))}%`;
  }
}

// 1. Tạo 2 trụ cho 2 bên
export const allyAetherPool = new SharedAetherPool('ally');
export const enemyAetherPool = new SharedAetherPool('enemy');

// 2. Cầu nối API cho game
export const globalAetherPool = {
  init: (units: any[]) => {
    allyAetherPool.destroyUI();
    enemyAetherPool.destroyUI();

    allyAetherPool.init(units);
    
    // --- CODE TEST UI: Bơm thông số giả để hiện trụ khi chưa ráp logic ---
    if (allyAetherPool.max === 0) {
        allyAetherPool.max = 100;
        allyAetherPool.current = 50;
        allyAetherPool.initUI();
        allyAetherPool.updateUI();
    }
    if (enemyAetherPool.max === 0) {
        enemyAetherPool.max = 100;
        enemyAetherPool.current = 50;
        enemyAetherPool.initUI();
        enemyAetherPool.updateUI();
    }
  },
  onTurnEnd: () => {
    allyAetherPool.onTurnEnd();
    enemyAetherPool.onTurnEnd();
  },
  consume: (cost: number) => allyAetherPool.consume(cost),
  updateUI: () => {
    allyAetherPool.updateUI();
    enemyAetherPool.updateUI();
  },
  destroy: () => {
    allyAetherPool.destroyUI();
    enemyAetherPool.destroyUI();
  },
  get current() { return allyAetherPool.current; },
  get max() { return allyAetherPool.max; },
  get regenPerTurn() { return allyAetherPool.regenPerTurn; }
};

// 3. --- MÓC NỐI TỰ ĐỘNG VÀO GAME ENGINE & ERUDA ---
if (typeof window !== 'undefined') {
  // Ní có thể mở Eruda gõ window.testAether() để ép nó mọc lên bất cứ lúc nào!
  (window as any).testAether = () => globalAetherPool.init([]);

  let isAetherInit = false;
  
  // Tự động mọc trụ khi Lượt (Turn) đầu tiên bắt đầu
  addGameEventListener(TURN_START, () => {
    if (!isAetherInit) {
       globalAetherPool.init([]); 
       isAetherInit = true;
    }
  });

  // Tự động đập trụ dọn dẹp khi ván đấu kết thúc
  addGameEventListener(BATTLE_END, () => {
    globalAetherPool.destroy();
    isAetherInit = false;
  });
}
