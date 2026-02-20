// FILE: src/aether.ts
import { AE_CLASS_COEFF } from './catalog'; // Điều chỉnh đường dẫn import nếu cần
import type { InstanceStats } from './meta'; // Import type để chuẩn TypeScript

export class SharedAetherPool {
  public max: number = 0;
  public current: number = 0;
  public regenPerTurn: number = 0;

  /**
   * Khởi tạo Bể AE dựa trên 9 nhân vật trong đội hình
   * @param teamUnits Mảng chứa thông số (InstanceStats) của 9 ô
   */
  public init(teamUnits: (InstanceStats & { className: string })[]) {
    this.max = 0;
    this.regenPerTurn = 0;

    for (const unit of teamUnits) {
      if (!unit) continue;
      
      // Cộng dồn Max AE
      this.max += (unit.aeMax || 0);

      // Tính Regen theo Hệ số Class (Laser WIL x Thấu kính Class)
      const coeff = (AE_CLASS_COEFF as any)[unit.className] || 0.55; 
      this.regenPerTurn += (unit.wil * coeff);
    }

    // Luật v0.4.1: Khởi đầu trận có sẵn 50% AE
    this.current = Math.floor(this.max / 2);
    
    // Đảm bảo số tròn
    this.regenPerTurn = Math.floor(this.regenPerTurn);
  }

  /** Gọi hàm này sau mỗi vòng SSIT (khi Slot 9 đánh xong) */
  public onTurnEnd() {
    this.current += this.regenPerTurn;
    if (this.current > this.max) {
      this.current = this.max;
    }
  }

  /** Dùng kỹ năng: Trả về true nếu đủ AE, false nếu thiếu */
  public consume(cost: number): boolean {
    if (this.current >= cost) {
      this.current -= cost;
      return true;
    }
    return false;
  }
}
