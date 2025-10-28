const ts = require('./vendor/typescript.js');

module.exports = {
  transpileModule: ts.transpileModule,
  ModuleKind: ts.ModuleKind,
  ScriptTarget: ts.ScriptTarget,
  JsxEmit: ts.JsxEmit,
  DiagnosticCategory: ts.DiagnosticCategory,
  flattenDiagnosticMessageText: ts.flattenDiagnosticMessageText,
  findConfigFile: ts.findConfigFile,
  readConfigFile: ts.readConfigFile,
  parseJsonConfigFileContent: ts.parseJsonConfigFileContent,
  sys: ts.sys,
};