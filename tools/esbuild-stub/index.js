const path = require('path');

function initializationError() {
  return new Error('esbuild stub initialization cycle');
}

function stripImportTypeStatements(code) {
  return code.replace(/^\s*import\s+type\s+[^;]+;?\s*$/gm, '');
}

function stripTypeAndInterfaceDeclarations(code) {
  let result = code;
  result = result.replace(/^\s*export\s+type\s+[A-Za-z0-9_<>,\s]+\s*=\s*{[\s\S]*?};?\s*(?:\r?\n)?/gm, '');
  result = result.replace(/^\s*export\s+type\s+[^{=;\n]+=[^;\n]+;?\s*$/gm, '');
  result = result.replace(/^\s*type\s+[A-Za-z0-9_<>,\s]+\s*=\s*{[\s\S]*?};?\s*(?:\r?\n)?/gm, '');
  result = result.replace(/^\s*type\s+[^;=\n]+=[^;\n]+;?\s*$/gm, '');
  result = result.replace(/^\s*declare\s+[^;]+;?\s*$/gm, '');
  result = result.replace(/^\s*interface\s+[^{]+{[\s\S]*?^\s*}\s*$/gm, '');
  return result;
}

function stripImplementsAndModifiers(code) {
  return code
    .replace(/\s+implements\s+[^{]+(?={)/g, '')
    .replace(/\breadonly\s+/g, '')
    .replace(/\bpublic\s+/g, '')
    .replace(/\bprivate\s+/g, '')
    .replace(/\bprotected\s+/g, '')
    .replace(/\babstract\s+/g, '');
}

function stripGenerics(code) {
  return code
    .replace(/([A-Za-z0-9_])<[^>]+>(?=\s*\()/g, '$1')
    .replace(/new\s+([A-Za-z0-9_$.]+)<[^>]+>/g, 'new $1');
}

function stripTypeAnnotations(code) {
  // Remove type annotations that appear after identifiers or destructured bindings.
  return code
    .replace(/(?<=[A-Za-z0-9_\]\}])\s*:\s*(?!['"{\[])([^=;,){}\]]+)(?=\s*(?:[=;,){}\]]|=>))/g, ' ')
    .replace(/(?<=\))\s*:\s*([^=;,){}\]]+)(?=\s*(?:{\s|=>|{))/g, '')
    .replace(/\)\s*:\s*([^=;,){}\]]+)(?=\s*=>)/g, ') =>');
}

function stripAssertions(code) {
  return code
    .replace(/\s+as\s+[^;\n,)]+/g, '')
    .replace(/\s+satisfies\s+[^;\n,)]+/g, '')
    .replace(/([A-Za-z0-9_\]])!\b/g, '$1');
}

function simpleTsTransform(code) {
  let result = code;
  result = stripImportTypeStatements(result);
  result = stripTypeAndInterfaceDeclarations(result);
  result = stripImplementsAndModifiers(result);
  result = stripGenerics(result);
  result = stripTypeAnnotations(result);
  result = stripAssertions(result);
  return result;
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

function performTransform(code, options = {}) {
  if (typeof code !== 'string') {
    throw new TypeError('esbuild stub transform expects code string');
  }
  const { loader, sourcemap, sourcefile } = options;
  const generateMap = Boolean(sourcemap);

  if (loader === 'ts' || loader === 'tsx') {
    const transformed = simpleTsTransform(code);
    return {
      code: transformed,
      map: generateMap ? createIdentitySourceMap(transformed, sourcefile) : null,
      warnings: [],
    };
  }

  return {
    code,
    map: generateMap ? createIdentitySourceMap(code, sourcefile) : null,
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
    warnings: [],
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

module.exports = {
  transform,
  transformSync,
  build,
};