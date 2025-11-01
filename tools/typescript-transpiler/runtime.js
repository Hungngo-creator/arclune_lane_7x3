const ts = require('./vendor/typescript.js');

const fallbackImportsNotUsedAsValues = {
  Remove: 0,
  Preserve: 1,
  Error: 2,
};

module.exports = {
  transpileModule: ts.transpileModule,
  ModuleKind: ts.ModuleKind,
  ScriptTarget: ts.ScriptTarget,
  JsxEmit: ts.JsxEmit,
  ImportsNotUsedAsValues: ts.ImportsNotUsedAsValues || fallbackImportsNotUsedAsValues,
  DiagnosticCategory: ts.DiagnosticCategory,
  flattenDiagnosticMessageText: ts.flattenDiagnosticMessageText,
  findConfigFile: ts.findConfigFile,
  readConfigFile: ts.readConfigFile,
  parseJsonConfigFileContent: ts.parseJsonConfigFileContent,
  sys: ts.sys,
};