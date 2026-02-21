"use strict";

const fs = require("fs");
const path = require("path");

let realTypescript = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
  realTypescript = require("typescript");
} catch (err) {
  realTypescript = null;
}

if (!realTypescript) {
  try {
    const nodeBinDir = path.dirname(process.execPath);
    const globalCandidate = path.resolve(nodeBinDir, "..", "lib", "node_modules", "typescript");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    realTypescript = require(globalCandidate);
  } catch (err) {
    realTypescript = null;
  }
}

const customTranspiler = require("../strip-typescript.js");

const ModuleKind = Object.freeze({
  None: "none",
  CommonJS: "commonjs",
  ES2015: "esm",
  ES2020: "esm",
  ES2022: "esm",
  ESNext: "esm",
});

const ScriptTarget = Object.freeze({
  ES3: "es2015",
  ES5: "es2015",
  ES2015: "es2015",
  ES2016: "es2016",
  ES2017: "es2017",
  ES2018: "es2018",
  ES2019: "es2019",
  ES2020: "es2020",
  ES2021: "es2021",
  ES2022: "es2022",
  ESNext: "esnext",
});

const JsxEmit = Object.freeze({
  None: "none",
  Preserve: "preserve",
  React: "transform",
  ReactNative: "transform",
  ReactJSX: "automatic",
  ReactJSXDev: "automatic",
});

const DiagnosticCategory = Object.freeze({
  Warning: 0,
  Error: 1,
  Suggestion: 2,
  Message: 3,
});

const fallbackFlatten = (message) => {
  if (message == null) {
    return "";
  }
  if (Array.isArray(message)) {
    return message.join(String.fromCharCode(10));
  }
  return String(message);
};

const flattenDiagnosticMessageText = realTypescript
  ? realTypescript.flattenDiagnosticMessageText
  : fallbackFlatten;
  
  const defaultSys = {
  fileExists(fileName) {
    try {
      return fs.existsSync(fileName);
    } catch (err) {
      return false;
    }
  },
  readFile(fileName) {
    try {
      return fs.readFileSync(fileName, "utf8");
    } catch (err) {
      return undefined;
    }
  },
};

function createMissingTypescriptError() {
  const message =
    'Không tìm thấy runtime TypeScript thật. Hãy sao chép thư mục "node_modules/typescript" từ một máy đã cài đầy đủ hoặc cài TypeScript trước khi bundle.';
  const error = new Error(message);
  error.code = "MISSING_TYPESCRIPT_RUNTIME";
  error.help =
    'Nếu bạn đang làm việc ngoại tuyến, hãy sao chép thư viện TypeScript hoặc cập nhật tools/typescript-transpiler để bao gồm runtime nội bộ.';
  return error;
}

function fallbackTranspileModule(source, options = {}) {
  const compilerOptions = options.compilerOptions || {};
  const sourceFile = options.fileName || "module.ts";
  let outputText;
  try {
    outputText = customTranspiler.transpile(String(source));
  } catch (err) {
    const error = createMissingTypescriptError();
    error.cause = err;
    throw error;
  }
  let sourceMapText = null;
  if (compilerOptions.sourceMap || compilerOptions.inlineSourceMap) {
    sourceMapText = null;
  }
  return {
    outputText,
    diagnostics: [],
    sourceMapText,
    emittedFiles: [sourceFile.replace(/\.ts(x)?$/, ".js")],
  };
}

  const transpileModule = realTypescript && typeof realTypescript.transpileModule === "function"
  ? realTypescript.transpileModule
  : fallbackTranspileModule;

const findConfigFile = realTypescript && typeof realTypescript.findConfigFile === "function"
  ? realTypescript.findConfigFile
  : (searchPath, fileExists = defaultSys.fileExists, configName = "tsconfig.json") => {
      let current = searchPath;
      while (true) {
        const candidate = path.join(current, configName);
        if (fileExists(candidate)) {
          return candidate;
        }
        const parent = path.dirname(current);
        if (parent === current) {
          return undefined;
        }
        current = parent;
      }
    };

  const readConfigFile = realTypescript && typeof realTypescript.readConfigFile === "function"
  ? realTypescript.readConfigFile
  : (fileName, readFile = defaultSys.readFile) => {
      try {
        const text = readFile(fileName);
        const config = text ? JSON.parse(text) : {};
        return { config, error: undefined };
      } catch (err) {
        return {
          config: undefined,
          error: {
            messageText: err && err.message ? err.message : String(err),
            category: DiagnosticCategory.Error,
            code: 0,
          },
        };
      }
    };

const parseJsonConfigFileContent =
  realTypescript && typeof realTypescript.parseJsonConfigFileContent === "function"
    ? realTypescript.parseJsonConfigFileContent
    : (json, host = defaultSys, basePath = process.cwd()) => {
        const effectiveHost = host || defaultSys;
        const compilerOptions = {
          ...(json && typeof json.compilerOptions === "object" ? json.compilerOptions : {}),
        };
        const files = Array.isArray(json && json.files)
          ? json.files
              .map((file) => path.resolve(basePath, file))
              .filter((fileName) => {
                if (typeof effectiveHost.fileExists === "function") {
                  return effectiveHost.fileExists(fileName);
                }
                return true;
              })
          : [];
        return {
          options: compilerOptions,
          fileNames: files,
          errors: [],
        };
      };

const sys = realTypescript && realTypescript.sys ? realTypescript.sys : defaultSys;

module.exports = {
  transpileModule,
  ModuleKind: realTypescript ? realTypescript.ModuleKind : ModuleKind,
  ScriptTarget: realTypescript ? realTypescript.ScriptTarget : ScriptTarget,
  JsxEmit: realTypescript ? realTypescript.JsxEmit : JsxEmit,
  DiagnosticCategory: realTypescript ? realTypescript.DiagnosticCategory : DiagnosticCategory,
  ImportsNotUsedAsValues: realTypescript ? realTypescript.ImportsNotUsedAsValues : {
    Remove: 0,
    Preserve: 1,
    Error: 2,
  },
  flattenDiagnosticMessageText,
  findConfigFile,
  readConfigFile,
  parseJsonConfigFileContent,
  sys,
};