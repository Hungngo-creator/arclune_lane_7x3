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
  const fsPromises: any;
  export = fsPromises;
}

declare module 'path' {
  const pathModule: any;
  export = pathModule;
}

declare module 'url' {
  const urlModule: any;
  export = urlModule;
}

declare module 'vm' {
  const vmModule: any;
  export = vmModule;
}

declare module 'assert/strict' {
  const assert: any;
  export = assert;
}

declare module 'child_process' {
  const childProcess: any;
  export = childProcess;
}

declare module 'node:*' {
  const value: any;
  export = value;
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