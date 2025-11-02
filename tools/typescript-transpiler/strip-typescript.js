"use strict";

const TYPE_IMPORT_EXPORT_RE = /\bimport\s+type\s+[^;]+;?/g;
const EXPORT_TYPE_SPECIFIER_RE = /\bexport\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?/g;
const EXPORT_TYPE_ALIAS_RE = /\bexport\s+type\s+[^;]+;?/g;
const DECLARE_KEYWORD_RE = /\bdeclare\s+/g;
const READONLY_KEYWORD_RE = /\breadonly\s+/g;
const IMPLEMENTS_CLAUSE_RE = /\bimplements\s+[^\{]+(?=\{)/g;
const SATISFIES_RE = /\s+satisfies\s+([^,;\n]+)/g;
const AS_ASSERTION_RE = /\s+as\s+([^,;\]\)\n]+)/g;
const GENERIC_CALL_RE = /([A-Za-z_$][\w$]*)<[^>]*>\s*\(/g;
const GENERIC_NEW_RE = /(new\s+[A-Za-z_$][\w$]*)<[^>]*>\s*\(/g;
const GENERIC_CLASS_RE = /(class\s+[A-Za-z_$][\w$]*)(\s+<[^>]*>)/g;
const GENERIC_FUNCTION_RE = /(function\s+[A-Za-z_$][\w$]*)(\s*<[^>]*>)(\s*\()/g;
const GENERIC_ARROW_RE = /(=\s*)<([^>]+)>\s*\(/g;
const GENERIC_TYPE_IMPORT_RE = /(import\s+\{[^}]*\})\s+from/g;

function createScanner(source) {
  let index = 0;
  const length = source.length;

  function peek(offset = 0) {
    const pos = index + offset;
    if (pos < 0 || pos >= length) return "";
    return source[pos];
  }

  function consume(count = 1) {
    const start = index;
    index += count;
    return source.slice(start, index);
  }

  function eof() {
    return index >= length;
  }

  return { peek, consume, eof, get index() { return index; }, set index(value) { index = value; } };
}

function skipWhitespace(scanner) {
  while (!scanner.eof()) {
    const ch = scanner.peek();
    if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
      scanner.consume();
      continue;
    }
    break;
  }
}

function skipLineComment(scanner) {
  while (!scanner.eof()) {
    const ch = scanner.consume();
    if (ch === "\n") break;
  }
}

function skipBlockComment(scanner) {
  while (!scanner.eof()) {
    const ch = scanner.consume();
    if (ch === "*" && scanner.peek() === "/") {
      scanner.consume();
      break;
    }
  }
}

function skipString(scanner, quote) {
  let escaped = false;
  while (!scanner.eof()) {
    const ch = scanner.consume();
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === quote) {
      break;
    }
    if (quote === "`" && ch === "$") {
      if (scanner.peek() === "{") {
        scanner.consume();
        skipTemplateExpression(scanner);
      }
    }
  }
}

function skipTemplateExpression(scanner) {
  let depth = 1;
  while (!scanner.eof() && depth > 0) {
    const ch = scanner.consume();
    if (ch === "`") {
      skipString(scanner, "`");
      continue;
    }
    if (ch === "\"") {
      skipString(scanner, "\"");
      continue;
    }
    if (ch === "'") {
      skipString(scanner, "'");
      continue;
    }
    if (ch === "/") {
      const next = scanner.peek();
      if (next === "/") {
        skipLineComment(scanner);
        continue;
      }
      if (next === "*") {
        scanner.consume();
        skipBlockComment(scanner);
        continue;
      }
    }
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
  }
}

function removeBlock(source, startIndex) {
  const scanner = createScanner(source);
  scanner.index = startIndex;
  let depth = 0;
  while (!scanner.eof()) {
    const ch = scanner.consume();
    if (ch === "\"") {
      skipString(scanner, "\"");
      continue;
    }
    if (ch === "'") {
      skipString(scanner, "'");
      continue;
    }
    if (ch === "`") {
      skipString(scanner, "`");
      continue;
    }
    if (ch === "/") {
      const next = scanner.peek();
      if (next === "/") {
        skipLineComment(scanner);
        continue;
      }
      if (next === "*") {
        scanner.consume();
        skipBlockComment(scanner);
        continue;
      }
    }
    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      if (depth === 0) {
        break;
      }
      depth--;
    }
  }
  return scanner.index;
}

function removeTypeBlocks(source, keyword) {
  const pattern = new RegExp(`(^|\\n)\\s*(export\\s+)?${keyword}\\s+[A-Za-z_$][\\w$]*(?:\\s*<[^>]*>)?\\s*`, "g");
  let match;
  let output = "";
  let lastIndex = 0;
  while ((match = pattern.exec(source))) {
    const start = match.index;
    output += source.slice(lastIndex, start);
    const scanner = createScanner(source);
    scanner.index = pattern.lastIndex;
    skipWhitespace(scanner);
    if (keyword === "type" && source[scanner.index] === "=") {
      scanner.consume();
      let depth = 0;
      while (!scanner.eof()) {
        const ch = scanner.consume();
        if (ch === "\"") {
          skipString(scanner, "\"");
          continue;
        }
        if (ch === "'") {
          skipString(scanner, "'");
          continue;
        }
        if (ch === "`") {
          skipString(scanner, "`");
          continue;
        }
        if (ch === "/") {
          const next = scanner.peek();
          if (next === "/") {
            skipLineComment(scanner);
            continue;
          }
          if (next === "*") {
            scanner.consume();
            skipBlockComment(scanner);
            continue;
          }
        }
        if (ch === "{" || ch === "(" || ch === "[") {
          depth++;
        } else if (ch === "}" || ch === ")" || ch === "]") {
          if (depth > 0) depth--;
        } else if (ch === ";" && depth === 0) {
          break;
        }
      }
      lastIndex = scanner.index;
    } else if (keyword === "interface") {
      if (source[scanner.index] === "{") {
        const endIndex = removeBlock(source, scanner.index);
        lastIndex = endIndex + 1;
        const maybeSemicolon = source[lastIndex];
        if (maybeSemicolon === ";") {
          lastIndex += 1;
        }
      } else {
        lastIndex = scanner.index;
      }
    } else {
      lastIndex = scanner.index;
    }
    pattern.lastIndex = lastIndex;
  }
  output += source.slice(lastIndex);
  return output;
}

function stripTypeAnnotations(source) {
  let code = source;
  code = code.replace(TYPE_IMPORT_EXPORT_RE, "");
  code = code.replace(EXPORT_TYPE_SPECIFIER_RE, "");
  code = code.replace(EXPORT_TYPE_ALIAS_RE, "");
  code = code.replace(DECLARE_KEYWORD_RE, "");
  code = code.replace(READONLY_KEYWORD_RE, "");
  code = code.replace(IMPLEMENTS_CLAUSE_RE, "");
  code = code.replace(SATISFIES_RE, (match, group) => ` /* satisfies ${group.trim()} */`);
  code = code.replace(AS_ASSERTION_RE, (match, group) => ` /* as ${group.trim()} */`);
  code = code.replace(GENERIC_NEW_RE, "$1(");
  code = code.replace(GENERIC_CALL_RE, "$1(");
  code = code.replace(GENERIC_CLASS_RE, "$1");
  code = code.replace(GENERIC_FUNCTION_RE, "$1$3");
  code = code.replace(GENERIC_ARROW_RE, "$1(");
  code = code.replace(GENERIC_TYPE_IMPORT_RE, "$1 from");

  code = removeTypeBlocks(code, "type");
  code = removeTypeBlocks(code, "interface");

  code = code.replace(/(class\s+[A-Za-z_$][\w$]*\s*extends\s+[^{]+)\{/g, (match) => match.replace(/\bimplements\s+[^\{]+/, ""));

  code = code.replace(/(\bconst\s+[A-Za-z_$][\w$]*|\blet\s+[A-Za-z_$][\w$]*|\bvar\s+[A-Za-z_$][\w$]*)(\s*\??)\s*:\s*([^=;\n]+)/g, (full, left, optional) => `${left}${optional}`);

  code = code.replace(/([\}\)\]]\s*):\s*([^=;\n\{]+)/g, "$1");

  code = code.replace(/([,\(]\s*\.{3}[A-Za-z_$][\w$]*)\s*:\s*([^=,\)]+)/g, "$1");

  code = code.replace(/([,\(]\s*[A-Za-z_$][\w$]*)(\??)\s*:\s*([^=,\)]+)/g, "$1$2");

  code = code.replace(/\?:/g, ":");

  code = code.replace(/\sas\s+const/g, " /* as const */");

  return code;
}

function transpile(source) {
  return stripTypeAnnotations(source);
}

module.exports = {
  transpile,
};
