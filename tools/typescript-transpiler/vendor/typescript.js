"use strict";
const esbuild = require("esbuild");
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
function flattenDiagnosticMessageText(message) {
  if (message == null) {
    return "";
  }
  return Array.isArray(message) ? message.join(String.fromCharCode(10)) : String(message);
}
function mapTarget(tsTarget) {
  return ScriptTarget[tsTarget] || "esnext";
}
function mapModule(tsModule) {
  switch (tsModule) {
    case ModuleKind.CommonJS:
      return "cjs";
    default:
      return "esm";
  }
}
function mapJsx(tsJsx) {
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
}
function transpileModule(input, options = {}) {
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
}
module.exports = {
  transpileModule,
  ModuleKind,
  ScriptTarget,
  JsxEmit,
  DiagnosticCategory,
  flattenDiagnosticMessageText,
};
