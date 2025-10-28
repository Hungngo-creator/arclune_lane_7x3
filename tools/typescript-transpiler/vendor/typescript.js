"use strict";
const fs = require("fs");
const path = require("path");

let realTypescript;
try {
  realTypescript = require("typescript");
} catch (err) {
  realTypescript = null;
}

 let ModuleKind;
let ScriptTarget;
let JsxEmit;
let DiagnosticCategory;
let flattenDiagnosticMessageText;
let transpileModule;
let findConfigFile;
let readConfigFile;
let parseJsonConfigFileContent;
let sys;

if (realTypescript && typeof realTypescript.transpileModule === "function") {
  ModuleKind = realTypescript.ModuleKind;
  ScriptTarget = realTypescript.ScriptTarget;
  JsxEmit = realTypescript.JsxEmit;
  DiagnosticCategory = realTypescript.DiagnosticCategory;
  flattenDiagnosticMessageText = realTypescript.flattenDiagnosticMessageText;
  transpileModule = realTypescript.transpileModule;
  findConfigFile = realTypescript.findConfigFile;
  readConfigFile = realTypescript.readConfigFile;
  parseJsonConfigFileContent = realTypescript.parseJsonConfigFileContent;
  sys = realTypescript.sys;
} else {
  const esbuild = require("esbuild");

  ModuleKind = Object.freeze({
    None: "none",
    CommonJS: "commonjs",
    ES2015: "esm",
    ES2020: "esm",
    ES2022: "esm",
    ESNext: "esm",
  });
  ScriptTarget = Object.freeze({
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
  JsxEmit = Object.freeze({
    None: "none",
    Preserve: "preserve",
    React: "transform",
    ReactNative: "transform",
    ReactJSX: "automatic",
    ReactJSXDev: "automatic",
  });
  DiagnosticCategory = Object.freeze({
    Warning: 0,
    Error: 1,
    Suggestion: 2,
    Message: 3,
  });

const mapTarget = (tsTarget) => ScriptTarget[tsTarget] || "esnext";
  const mapModule = (tsModule) => {
    switch (tsModule) {
      case ModuleKind.CommonJS:
        return "cjs";
      default:
        return "esm";
    }
  };
  const mapJsx = (tsJsx) => {
    switch (tsJsx) {
      case JsxEmit.Preserve:
        return "preserve";
      case JsxEmit.React:
      case JsxEmit.ReactNative:
        return "transform";
      case JsxEmit.ReactJSX:
      case JsxEmit.ReactJSXDev:
        return "automatic";
      default:
        return "none";
    }
  };

  flattenDiagnosticMessageText = (message) => {
    if (message == null) {
      return "";
    }
    return Array.isArray(message) ? message.join(String.fromCharCode(10)) : String(message);
  };

  transpileModule = (input, options = {}) => {
    const compilerOptions = options.compilerOptions || {};
    const format = mapModule(compilerOptions.module);
    const target = mapTarget(compilerOptions.target);
    const jsx = mapJsx(compilerOptions.jsx);
    const result = esbuild.transformSync(input, {
      loader: options.fileName && options.fileName.endsWith(".tsx") ? "tsx" : "ts",
      format,
      target,
      jsx,
      sourcemap: compilerOptions.sourceMap || compilerOptions.inlineSourceMap || false,
      sourcefile: options.fileName,
    });
    return {
      outputText: result.code,
      diagnostics: [],
      sourceMapText: result.map || undefined,
    };
  };

  const defaultSys = {
    fileExists(fileName) {
      try {
        return fs.existsSync(fileName);
      } catch {
        return false;
      }
    },
    readFile(fileName) {
      try {
        return fs.readFileSync(fileName, "utf8");
      } catch {
        return undefined;
      }
    },
  };

  findConfigFile = (searchPath, fileExists = defaultSys.fileExists, configName = "tsconfig.json") => {
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

  readConfigFile = (fileName, readFile = defaultSys.readFile) => {
    try {
      const text = readFile(fileName);
      const config = JSON.parse(text);
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

  parseJsonConfigFileContent = (json, host = defaultSys, basePath = process.cwd()) => {
    const effectiveHost = host || defaultSys;
    const compilerOptions = { ...(json && json.compilerOptions ? json.compilerOptions : {}) };
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

sys = defaultSys;
}

module.exports = {
  transpileModule,
  ModuleKind,
  ScriptTarget,
  JsxEmit,
  DiagnosticCategory,
  flattenDiagnosticMessageText,
  findConfigFile,
  readConfigFile,
  parseJsonConfigFileContent,
  sys,
};