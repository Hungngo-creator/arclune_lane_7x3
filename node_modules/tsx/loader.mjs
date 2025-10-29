import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import typescript from 'typescript-transpiler';

const projectRoot = path.resolve(process.cwd());
let cachedTsCompilerOptions;

function getTsCompilerOptions() {
  if (cachedTsCompilerOptions) {
    return cachedTsCompilerOptions;
  }

  const configPath = typescript.findConfigFile(projectRoot, typescript.sys.fileExists, 'tsconfig.json');
  if (configPath) {
    const config = typescript.readConfigFile(configPath, typescript.sys.readFile);
    if (!config.error) {
      const parsed = typescript.parseJsonConfigFileContent(
        config.config,
        typescript.sys,
        path.dirname(configPath)
      );
      cachedTsCompilerOptions = parsed.options;
      return cachedTsCompilerOptions;
    }
  }

  cachedTsCompilerOptions = {};
  return cachedTsCompilerOptions;
}

export async function load(url, context, defaultLoad) {
  if (url.startsWith('file://')) {
    const filename = fileURLToPath(url);
    if (filename.startsWith(projectRoot)) {
      if (filename.endsWith('.json')) {
        const source = await readFile(filename, 'utf8');
        const moduleSource = `export default ${source.trim()} ;`;
        return {
          format: 'module',
          source: moduleSource,
          shortCircuit: true,
        };
      }

      if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
        const source = await readFile(filename, 'utf8');
        const compilerOptions = {
          ...getTsCompilerOptions(),
          module: typescript.ModuleKind.ESNext,
        };
        if (!compilerOptions.target) {
          compilerOptions.target = typescript.ScriptTarget.ESNext;
        }
        if (filename.endsWith('.tsx')) {
          compilerOptions.jsx = compilerOptions.jsx ?? typescript.JsxEmit.ReactJSX;
        }

        let transpiled;
        try {
          transpiled = typescript.transpileModule(source, {
            compilerOptions,
            fileName: filename,
            reportDiagnostics: false,
          });
        } catch (err) {
          if (err && err.code === 'MISSING_TYPESCRIPT_RUNTIME') {
            throw new Error(
              'tsx stub: thiếu thư viện TypeScript thật. Sao chép node_modules/typescript từ môi trường đã cài đặt hoặc kết nối mạng để chạy npm install.',
            );
          }
          throw err;
        }

        return {
          format: 'module',
          source: transpiled.outputText,
          shortCircuit: true,
        };
      }

      if (filename.endsWith('.js') || filename.endsWith('.mjs')) {
        const source = await readFile(filename, 'utf8');
        return {
          format: 'module',
          source,
          shortCircuit: true,
        };
      }
    }
  }
  return defaultLoad(url, context, defaultLoad);
}

export function resolve(specifier, context, defaultResolve) {
  return defaultResolve(specifier, context, defaultResolve);
}