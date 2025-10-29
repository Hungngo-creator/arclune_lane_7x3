let zModule;

beforeAll(async () => {
  zModule = await import('./index.js');
});

describe('ZodObject.superRefine', () => {
  test('ctx.addIssue without path produces empty path array', () => {
    const { z, ZodError } = zModule;

    const schema = z
      .object({
        name: z.string(),
      })
      .superRefine((data, ctx) => {
        if (data.name !== 'hợp lệ') {
          ctx.addIssue({
            message: 'Tên không hợp lệ',
            code: z.ZodIssueCode.custom,
          });
        }
      });

    let capturedError;

    expect(() => {
      try {
        schema.parse({ name: 'sai' });
      } catch (error) {
        capturedError = error;
        throw error;
      }
    }).toThrow(ZodError);

    expect(capturedError).toBeInstanceOf(ZodError);
    expect(capturedError.issues).toHaveLength(1);
    expect(Array.isArray(capturedError.issues[0].path)).toBe(true);
    expect(capturedError.issues[0].path).toHaveLength(0);
  });
});
