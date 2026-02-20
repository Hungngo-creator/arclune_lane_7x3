// FILE: src/aether.ts
import { AE_CLASS_COEFF } from './catalog.ts';

class SharedAetherPool {
  public max: number = 100; // Mặc định để test
  public current: number = 50;
  public regenPerTurn: number = 10;
  private uiFill: HTMLElement | null = null;

  constructor() {
    this.initUI();
  }
export { SharedAetherPool }; 

  /** Tự động vẽ Cột Trụ lên màn hình mà không cần chạm vào HTML */
  private initUI() {
    // Đảm bảo code chỉ chạy trên trình duyệt
    if (typeof document === 'undefined') return;

    let container = document.getElementById('aether-pillar-container');
    if (!container) {
      // 1. Tạo vỏ cột trụ
      container = document.createElement('div');
      container.id = 'aether-pillar-container';
      // CSS gắn thẳng vào code (PA1: Sau lưng ô Leader)
      container.style.cssText = 'position: fixed; bottom: 15%; left: 50%; transform: translateX(-50%); width: 25px; height: 150px; background: rgba(10, 10, 30, 0.7); border: 2px solid #00ffff; border-radius: 5px; z-index: 9999; box-shadow: 0 0 15px rgba(0,255,255,0.3); pointer-events: none;';
      
      // 2. Tạo lõi dung dịch Aether
      this.uiFill = document.createElement('div');
      this.uiFill.style.cssText = 'position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(to top, #8a2be2, #00ffff); transition: height 0.4s ease-out; box-shadow: 0 0 10px #00ffff;';
      
      // Gắn vào Body
      container.appendChild(this.uiFill);
      document.body.appendChild(container);
    } else {
      this.uiFill = container.firstElementChild as HTMLElement;
    }

    this.updateUI();
  }

  /** Cập nhật chiều cao của dung dịch Aether */
  public updateUI() {
    if (!this.uiFill) return;
    const percent = this.max > 0 ? (this.current / this.max) * 100 : 0;
    this.uiFill.style.height = `${Math.max(0, Math.min(100, percent))}%`;
  }

  // --- CÁC HÀM LOGIC ---
  public onTurnEnd() {
    this.current = Math.min(this.max, this.current + this.regenPerTurn);
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
}

// KHỞI TẠO NGAY LẬP TỨC ĐỂ HIỂN THỊ UI
export const globalAetherPool = new SharedAetherPool();
