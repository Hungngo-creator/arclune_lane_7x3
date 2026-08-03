//home (termux)/arclune_lane_7x3/tools/esbuild-stub/index.js

const path = require('path');
let ts;
let scannerRuntime;

function getTypeScriptTranspiler() {
  if (!ts) {
    // Always use the repository copy.  The stub itself is committed both under
    // tools/ and node_modules/, while a plain package lookup can select an old
    // node_modules/typescript-transpiler snapshot after a git pull in Termux.
    ts = require(path.resolve(__dirname, '..', '..', 'tools', 'typescript-transpiler'));
  }
  return ts;
}

function initializationError() {
  return new Error('esbuild stub initialization cycle');
}

function getTypeScriptScanner() {
  if (!scannerRuntime) scannerRuntime = require('typescript');
  return scannerRuntime;
}

function createIdentitySourceMap(code, sourcefile = '<stdin>') {
  return JSON.stringify({
    version: 3,
    sources: [sourcefile],
    names: [],
    mappings: '',
    sourcesContent: [code],
  });
}

// esbuild's `define` option is a compile-time token substitution, not a text
// replacement. Walk TypeScript's syntax tree so quoted text, comments, object
// keys, and longer identifiers are never changed by the offline implementation.
function applyDefines(code, define, sourcefile = 'stdin.js') {
  if (!define || typeof define !== 'object' || Object.keys(define).length === 0) return code;
  const tsRuntime = getTypeScriptScanner();
  const scriptKind = sourcefile.endsWith('.tsx') ? tsRuntime.ScriptKind.TSX
    : sourcefile.endsWith('.ts') ? tsRuntime.ScriptKind.TS
      : tsRuntime.ScriptKind.JS;
  const source = tsRuntime.createSourceFile(sourcefile, code, tsRuntime.ScriptTarget.Latest, true, scriptKind);
  const replacements = [];
  const propertyChain = (node, names) => {
    let current = node;
    for (let index = names.length - 1; index > 0; index -= 1) {
      if (!tsRuntime.isPropertyAccessExpression(current) || current.name.text !== names[index]) return false;
      current = current.expression;
    }
    return names[0] === 'import.meta'
      ? tsRuntime.isMetaProperty(current) && current.keywordToken === tsRuntime.SyntaxKind.ImportKeyword && current.name.text === 'meta'
      : tsRuntime.isIdentifier(current) && current.text === names[0];
  };
  const visit = (node) => {
    let key;
    if (propertyChain(node, ['process', 'env', 'NODE_ENV'])) key = 'process.env.NODE_ENV';
    else if (propertyChain(node, ['import.meta', 'env', 'MODE'])) key = 'import.meta.env.MODE';
    else if (tsRuntime.isIdentifier(node) && node.text === '__DEV__') {
      const parent = node.parent;
      const isName = (tsRuntime.isPropertyAccessExpression(parent) && parent.name === node)
        || (tsRuntime.isPropertyAssignment(parent) && parent.name === node)
        || (tsRuntime.isShorthandPropertyAssignment(parent) && parent.name === node)
        || (tsRuntime.isDeclaration(parent) && parent.name === node);
      if (!isName) key = '__DEV__';
    }
    if (key && Object.prototype.hasOwnProperty.call(define, key)) {
      replacements.push({ start: node.getStart(source), end: node.end, text: String(define[key]) });
      return;
    }
    tsRuntime.forEachChild(node, visit);
  };
  visit(source);
  for (let index = replacements.length - 1; index >= 0; index -= 1) {
    const replacement = replacements[index];
    code = code.slice(0, replacement.start) + replacement.text + code.slice(replacement.end);
  }
  return code;
}

function performTransform(code, options = {}) {
  if (typeof code !== 'string') {
    throw new TypeError('esbuild stub transform expects code string');
  }
  const { loader, sourcemap, sourcefile } = options;
  code = applyDefines(code, options.define, sourcefile);
  const generateMap = Boolean(sourcemap);

  if (loader === 'ts' || loader === 'tsx') {
    const ts = getTypeScriptTranspiler();
    const compilerOptions = {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2023,
      lib: ['ESNext', 'DOM'],
      useDefineForClassFields: true,
      sourceMap: generateMap,
    };

    if (loader === 'tsx') {
      compilerOptions.jsx = ts.JsxEmit.React;
    }
    const fileName = sourcefile || (loader === 'tsx' ? 'stdin.tsx' : 'stdin.ts');
    let transpileResult;
    try {
      transpileResult = ts.transpileModule(code, {
        compilerOptions,
        fileName,
        reportDiagnostics: true,
      });
    } catch (err) {
      if (err && (err.code === 'MISSING_TYPESCRIPT_RUNTIME' || err.name === 'MISSING_TYPESCRIPT_RUNTIME')) {
        throw Object.assign(
          new Error(
            'Không thể transpile TypeScript vì thiếu runtime TypeScript. Hãy sao chép thư mục "node_modules/typescript" từ một máy đã cài npm install hoặc cài đặt thủ công trước khi bundle.',
          ),
          { cause: err },
        );
      }
      throw err;
    }
    const warnings = (transpileResult.diagnostics || []).map((diagnostic) => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      let location = null;
      if (diagnostic.file && typeof diagnostic.start === 'number') {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
          diagnostic.start
        );
        location = {
          file: diagnostic.file.fileName,
          line: line + 1,
          column: character + 1,
        };
      } else if (sourcefile) {
        location = {
          file: sourcefile,
          line: 1,
          column: 1,
        };
      }
      return {
        text: message,
        level: diagnostic.category === ts.DiagnosticCategory.Error ? 'error' : 'warning',
        location,
      };
    });
    let outputCode = transpileResult.outputText;
    const mapText = generateMap ? transpileResult.sourceMapText || null : null;
    if (mapText && sourcemap === 'inline') {
      const inlineComment = `\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(mapText, 'utf8').toString('base64')}`;
      outputCode += inlineComment;
    }
    return {
      code: outputCode,
      map: mapText,
      warnings,
    };
  }

  const mapText = generateMap ? createIdentitySourceMap(code, sourcefile) : null;
  let outputCode = code;
  if (mapText && sourcemap === 'inline') {
    const inlineComment = `\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(mapText, 'utf8').toString('base64')}`;
    outputCode += inlineComment;
  }
  return {
    code: outputCode,
    map: mapText,
    warnings: [],
  };
}

async function transform(code, options = {}) {
  return performTransform(code, options);
}

function transformSync(code, options = {}) {
  return performTransform(code, options);
}

async function build(options = {}) {
  const { stdin, write = true, metafile } = options;
  if (!stdin || typeof stdin.contents !== 'string') {
    throw initializationError();
  }
  if (write) {
    throw initializationError();
  }
  const text = stdin.contents;
  const transformed = await transform(text, {
    loader: stdin.loader,
    sourcemap: options.sourcemap,
    sourcefile: stdin.sourcefile,
    define: options.define,
  });
  const outputText = transformed.code;
  const outputPath = options.outfile
    ? options.outfile
    : options.outdir
      ? path.join(options.outdir, stdin.sourcefile || 'stdin.js')
      : stdin.sourcefile || '<stdout>';
  const buffer = Buffer.from(outputText, 'utf8');
  const outputFiles = [
    {
      path: outputPath,
      text: outputText,
      contents: buffer,
    },
  ];
  if (transformed.map && options.sourcemap === 'external') {
    const mapPath = `${outputPath}.map`;
    outputFiles.push({
      path: mapPath,
      text: transformed.map,
      contents: Buffer.from(transformed.map, 'utf8'),
    });
  }
  const result = {
    outputFiles,
    warnings: transformed.warnings || [],
  };
  if (metafile) {
    const inputPath = stdin.sourcefile || '<stdin>';
    result.metafile = {
      inputs: {
        [inputPath]: {
          bytes: Buffer.byteLength(stdin.contents, 'utf8'),
        },
      },
      outputs: {
        [outputPath]: {
          bytes: buffer.byteLength,
          inputs: {
            [inputPath]: {
              bytesInOutput: buffer.byteLength,
            },
          },
        },
      },
    };
  }
  return result;
}

function getFallbackTransformerKind() {
  return getTypeScriptTranspiler().__arcTransformerKind || 'unknown';
}

module.exports = {
  transform,
  transformSync,
  build,
  getFallbackTransformerKind,
};

module.exports.__arcStub = true;