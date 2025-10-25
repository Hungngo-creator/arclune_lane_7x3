export async function loadConfig<T>(
  resource: URL | string,
  schema: { parse(input: unknown): T }
): Promise<T> {
  const target = resource instanceof URL ? resource : new URL(resource, import.meta.url);
  try {
    const module = await import(target.href);
    const value = 'default' in module ? module.default : module;
    return schema.parse(value);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Không thể tải cấu hình từ ${target.href}: ${message}`, {
      cause: error instanceof Error ? error : undefined
    });
  }
}