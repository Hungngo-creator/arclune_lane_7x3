const path = require('path');

let cachedTypescript;
const TYPESCRIPT_INSTALL_ERROR = 'TypeScript loader requires the "typescript" package. Please install it (for example, "npm install typescript") before building.';

function loadTypescript(){
  if (cachedTypescript){
    return cachedTypescript;
  }
  try {
    cachedTypescript = require('typescript');
    return cachedTypescript;
  } catch (error){
    const err = new Error(TYPESCRIPT_INSTALL_ERROR);
    err.cause = error;
    throw err;
  }
}

function mapScriptTarget(ts, target){
  const defaultTarget = ts.ScriptTarget.ES2023;
  if (!target){
    return defaultTarget;
  }
  const normalized = String(target).toLowerCase();
  const mapping = {
    es3: ts.ScriptTarget.ES3,
    es5: ts.ScriptTarget.ES5,
    es2015: ts.ScriptTarget.ES2015,
    es2016: ts.ScriptTarget.ES2016,
    es2017: ts.ScriptTarget.ES2017,
    es2018: ts.ScriptTarget.ES2018,
    es2019: ts.ScriptTarget.ES2019,
    es2020: ts.ScriptTarget.ES2020,
    es2021: ts.ScriptTarget.ES2021,
    es2022: ts.ScriptTarget.ES2022,
    es2023: ts.ScriptTarget.ES2023,
    esnext: ts.ScriptTarget.ESNext,
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
    const typescript = loadTypescript();
    if (!typescript){
      throw new Error(TYPESCRIPT_INSTALL_ERROR);
    }
    const compilerOptions = {
      module: typescript.ModuleKind.ESNext,
      target: mapScriptTarget(typescript, target),
      sourceMap: generateMap && sourcemap !== 'inline',
      inlineSourceMap: sourcemap === 'inline',
      inlineSources: Boolean(sourcemap),
      jsx: loader === 'tsx' ? typescript.JsxEmit.Preserve : undefined,
    };
    const transpileResult = typescript.transpileModule(code, { compilerOptions, fileName: sourcefile });
    const diagnostics = transpileResult.diagnostics || [];
    const errors = diagnostics.filter((diag) => diag.category === typescript.DiagnosticCategory.Error);
    if (errors.length > 0){
      const message = errors.map((diag) => typescript.flattenDiagnosticMessageText(diag.messageText, '\n')).join('\n');
      throw new Error(`TypeScript transpile failed: ${message}`);
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
