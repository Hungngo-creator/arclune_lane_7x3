export function loadConfig<T>(rawConfig: unknown, schema: { parse(input: unknown): T }): T {
  try {
    return schema.parse(rawConfig);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Không thể tải cấu hình: ${message}`, {
      cause: error instanceof Error ? error : undefined
    });
  }
}