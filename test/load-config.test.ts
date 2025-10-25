import { describe, expect, it } from '@jest/globals';
import { z } from 'zod';

import { loadConfig } from '../src/data/load-config.ts';

const SampleSchema = z.object({
  name: z.string(),
  version: z.number(),
  flags: z.object({ enabled: z.boolean() })
});

describe('loadConfig helper', () => {
  it('tải cấu hình hợp lệ và trả về dữ liệu đã kiểm chứng', async () => {
    const config = await loadConfig(
      new URL('./helpers/sample-config.ts', import.meta.url),
      SampleSchema
    );

    expect(config).toEqual({
      name: 'demo-config',
      version: 1,
      flags: { enabled: true }
    });
  });

  it('ném lỗi khi dữ liệu không khớp schema', async () => {
    await expect(
      loadConfig(new URL('./helpers/sample-config-invalid.ts', import.meta.url), SampleSchema)
    ).rejects.toThrow(/Không thể tải cấu hình/);
  });
});
