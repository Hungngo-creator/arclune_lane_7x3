const path = require('path');

const {
  transpileModule,
  ModuleKind,
  ScriptTarget,
  DiagnosticCategory,
  JsxEmit,
  flattenDiagnosticMessageText,
} = require('typescript-transpiler');

function mapScriptTarget(target){
  const defaultTarget = ScriptTarget.ES2023;
  if (!target){
    return defaultTarget;
  }
  const normalized = String(target).toLowerCase();
  const mapping = {
    es3: ScriptTarget.ES3,
    es5: ScriptTarget.ES5,
    es2015: ScriptTarget.ES2015,
    es2016: ScriptTarget.ES2016,
    es2017: ScriptTarget.ES2017,
    es2018: ScriptTarget.ES2018,
    es2019: ScriptTarget.ES2019,
    es2020: ScriptTarget.ES2020,
    es2021: ScriptTarget.ES2021,
    es2022: ScriptTarget.ES2022,
    es2023: ScriptTarget.ES2023,
    esnext: ScriptTarget.ESNext,
  };
  return mapping[normalized] ?? defaultTarget;
}

function shouldGenerateSourceMap(sourcemap){
  if (!sourcemap){
    return false;
  }
  if (sourcemap === 'inline' || sourcemap === 'both' || sourcemap === 'external'){
    return true;
  }
  return Boolean(sourcemap);
}

function createIdentitySourceMap(code, sourcefile = '<stdin>'){
  return JSON.stringify({
    version: 3,
    sources: [sourcefile],
    names: [],
    mappings: '',
    sourcesContent: [code],
  });
}

async function transform(code, options = {}){
  if (typeof code !== 'string'){
    throw new TypeError('esbuild stub transform expects code string');
  }
  const { loader, target, sourcemap, sourcefile } = options;
  const generateMap = shouldGenerateSourceMap(sourcemap);
  if (loader === 'ts' || loader === 'tsx'){
    const compilerOptions = {
      module: ModuleKind.ESNext,
      target: mapScriptTarget(target),
      sourceMap: generateMap && sourcemap !== 'inline',
      inlineSourceMap: sourcemap === 'inline',
      inlineSources: Boolean(sourcemap),
      jsx: loader === 'tsx' ? JsxEmit.Preserve : undefined,
    };
    const transpileResult = transpileModule(code, { compilerOptions, fileName: sourcefile });
    const diagnostics = transpileResult.diagnostics || [];
    const errors = diagnostics.filter((diag) => diag.category === DiagnosticCategory.Error);
    if (errors.length > 0){
      const message = errors.map((diag) => flattenDiagnosticMessageText(diag.messageText, '\n')).join('\n');
      throw new Error(`Internal TypeScript transpiler failure: ${message}`);
    }
    return {
      code: transpileResult.outputText,
      map: transpileResult.sourceMapText ?? null,
      warnings: [],
    };
  }
  return {
    code,
    map: generateMap ? createIdentitySourceMap(code, sourcefile) : null,
    warnings: [],
  };
}

 async function build(options = {}){
  const { stdin, write = true, metafile } = options;
  if (!stdin || typeof stdin.contents !== 'string'){
    throw new Error('esbuild stub build currently only supports stdin.contents');
  }
  if (write){
    throw new Error('esbuild stub build does not support write=true');
  }
  const text = stdin.contents;
  let transformed;
  try {
    transformed = await transform(text, {
      loader: stdin.loader,
      target: options.target,
      sourcemap: options.sourcemap,
      sourcefile: stdin.sourcefile,
    });
  } catch (err){
    throw new Error(err?.message || 'esbuild stub transform failed');
  }
  const outputText = transformed.code;
  const outputPath = options.outfile
    ? options.outfile
    : options.outdir
      ? path.join(options.outdir, stdin.sourcefile || 'stdin.js')
      : stdin.sourcefile || '<stdout>';
  const buffer = Buffer.from(outputText, 'utf8');
  const outputFiles = [{
    path: outputPath,
    text: outputText,
    contents: buffer,
  }];
  if (transformed.map && options.sourcemap === 'external'){
    const mapPath = `${outputPath}.map`;
    outputFiles.push({
      path: mapPath,
      text: transformed.map,
      contents: Buffer.from(transformed.map, 'utf8'),
    });
  }
  const result = {
    outputFiles,
    warnings: [],
  };
  if (metafile){
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

module.exports = { transform, build };
