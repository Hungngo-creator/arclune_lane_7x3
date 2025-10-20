interface DirentLike {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
}

interface ReaddirOptions {
  withFileTypes?: boolean;
}

interface MkdirOptions {
  recursive?: boolean;
}

interface WriteFileOptions {
  encoding?: string;
}

interface ReadFileOptions {
  encoding?: string;
}

declare module 'fs/promises' {
  const fsPromises: {
    readdir(path: string, options: { withFileTypes: true }): Promise<DirentLike[]>;
    readdir(path: string, options?: ReaddirOptions): Promise<string[]>;
    readFile(path: string, options: ReadFileOptions | string): Promise<string>;
    writeFile(path: string, data: string, options?: WriteFileOptions | string): Promise<void>;
    mkdir(path: string, options?: MkdirOptions): Promise<void>;
  };
  export default fsPromises;
}

declare module 'path' {
  function join(...parts: string[]): string;
  function resolve(...parts: string[]): string;
  function dirname(path: string): string;
  function relative(from: string, to: string): string;
  const sep: string;
  export { dirname, join, relative, resolve, sep };
  export default {
    join,
    resolve,
    dirname,
    relative,
    sep,
  };
}

declare module 'url' {
  function fileURLToPath(url: string | URL): string;
  export { fileURLToPath };
}

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }

  interface Process {
    env: ProcessEnv;
    argv: string[];
    exit(code?: number): never;
    exitCode?: number;
  }
}

declare const process: NodeJS.Process;

declare function require(id: string): unknown;