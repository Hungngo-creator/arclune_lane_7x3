// Minimal Jest type declarations for local type checking.
declare namespace jest {
  type AnyFunction = (...args: any[]) => any;

  interface MockInstance<T extends AnyFunction = AnyFunction> {
    (...args: Parameters<T>): ReturnType<T>;
    mock: {
      calls: Array<Parameters<T>>;
      results: Array<{ type: string; value: unknown }>;
    };
    mockImplementation(fn: T): MockInstance<T>;
    mockReturnValue(value: ReturnType<T>): MockInstance<T>;
    mockReset(): MockInstance<T>;
  }

  interface JestGlobals {
    fn<T extends AnyFunction = AnyFunction>(implementation?: T): MockInstance<T>;
    resetModules(): void;
  }

  interface Matchers<R> {
    toBe(expected: unknown): R;
    toEqual(expected: unknown): R;
    toBeTruthy(): R;
    toBeFalsy(): R;
    toBeUndefined(): R;
    toBeNull(): R;
    toHaveLength(expected: number): R;
    toHaveBeenCalledTimes(expected: number): R;
    toHaveBeenCalled(): R;
    toMatchSnapshot(): R;
    toContain(expected: unknown): R;
    toHaveBeenCalledWith(...expected: unknown[]): R;
    toBeGreaterThan(expected: number): R;
    toBeGreaterThanOrEqual(expected: number): R;
    not: Matchers<R>;
  }

  interface Expect {
    <T = unknown>(actual: T): Matchers<T>;
    any(constructor: unknown): unknown;
    arrayContaining<T>(expected: readonly T[]): unknown;
    objectContaining<T extends Record<string, unknown>>(expected: T): unknown;
    extend(matchers: Record<string, AnyFunction>): void;
  }

  interface Lifecycle {
    (fn: () => void | Promise<void>, timeout?: number): void;
  }

  interface TestFunction {
    (name: string, fn?: () => void | Promise<void>, timeout?: number): void;
    only(name: string, fn?: () => void | Promise<void>, timeout?: number): void;
    skip(name: string, fn?: () => void | Promise<void>, timeout?: number): void;
    todo(name: string): void;
  }

  interface DescribeFunction {
    (name: string, fn: () => void): void;
    only(name: string, fn: () => void): void;
    skip(name: string, fn: () => void): void;
  }
}

declare const jest: jest.JestGlobals;
declare const expect: jest.Expect;
declare const test: jest.TestFunction;
declare const it: jest.TestFunction;
declare const describe: jest.DescribeFunction;
declare const beforeEach: jest.Lifecycle;
declare const afterEach: jest.Lifecycle;
declare const beforeAll: jest.Lifecycle;
declare const afterAll: jest.Lifecycle;

declare module '@jest/globals' {
  export { jest, expect, test, it, describe, beforeEach, afterEach, beforeAll, afterAll };
}
