export function assertDefined<T>(value: T | null | undefined, message?: string): T {
  if (value === undefined || value === null) {
    throw new Error(message ?? 'Giá trị mong đợi phải được định nghĩa.');
  }
  return value;
}
