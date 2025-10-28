import { describe, expect, it } from '@jest/globals';
import { z } from 'zod';

import { loadConfig } from '../src/data/load-config.ts';
import rawSampleConfig from './helpers/sample-config.ts';
import rawInvalidConfig from './helpers/sample-config-invalid.ts';

const SampleSchema = z.object({
  name: z.string(),
  version: z.number(),
  flags: z.object({ enabled: z.boolean() })
});

describe('loadConfig helper', () => {
  it('tải cấu hình hợp lệ và trả về dữ liệu đã kiểm chứng', () => {
    const config = loadConfig(rawSampleConfig, SampleSchema);

    expect(config).toEqual({
      name: 'demo-config',
      version: 1,
      flags: { enabled: true }
    });
  });

  it('ném lỗi khi dữ liệu không khớp schema', () => {
    expect(() => loadConfig(rawInvalidConfig, SampleSchema)).toThrow(/Không thể tải cấu hình/);
  });
});