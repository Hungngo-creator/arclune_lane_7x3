import { getVinhDaWaveConfig } from '../simulation.ts';

export interface VinhDaBalanceCheck { id: string; ok: boolean; message: string; }

export const checkVinhDaTier11FirstNightDrops = (): VinhDaBalanceCheck => {
  const config = getVinhDaWaveConfig(1, 1.1);
  return {
    id: 'tier-1.1-first-night-dark-stone',
    ok: config.threatBudget >= 8 && config.threatBudget <= 10,
    message: 'Tier 1.1 đêm đầu giữ budget 8–10 để mục tiêu rơi khoảng 4–8 Dạ Thạch khi giết phần lớn quái, không đủ nâng quá nhiều cấp ngay.'
  };
};

