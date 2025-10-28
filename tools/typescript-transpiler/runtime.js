const ts = require('./vendor/typescript.js');

module.exports = {
  transpileModule: ts.transpileModule,
  ModuleKind: ts.ModuleKind,
  ScriptTarget: ts.ScriptTarget,
  JsxEmit: ts.JsxEmit,
  DiagnosticCategory: ts.DiagnosticCategory,
  flattenDiagnosticMessageText: ts.flattenDiagnosticMessageText,
};