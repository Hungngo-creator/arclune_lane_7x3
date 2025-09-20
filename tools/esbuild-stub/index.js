const DEFAULT_OPTIONS = {
  target: []
};

function transform(code, options = {}){
  if (typeof code !== 'string'){
    throw new TypeError('esbuild stub transform expects code string');
  }
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const result = transpile(code, opts);
  return Promise.resolve({ code: result, map: null, warnings: [] });
}

function transpile(code){
  let out = String(code);
  out = transformOptionalChaining(out);
  out = transformNullish(out);
  return out;
}

function transformOptionalChaining(input){
  let code = input;
  let searchIndex = 0;
  while (true){
    const idx = findOptional(code, searchIndex);
    if (idx === -1) break;
    const { start, end, replacement } = replaceOptionalAt(code, idx);
    code = code.slice(0, start) + replacement + code.slice(end);
    searchIndex = start + replacement.length;
  }
  return code;
}

function transformNullish(input){
  let code = input;
  let searchIndex = 0;
  while (true){
    const idx = findNullish(code, searchIndex);
    if (idx === -1) break;
    const { start, end, replacement } = replaceNullishAt(code, idx);
    code = code.slice(0, start) + replacement + code.slice(end);
    searchIndex = start + replacement.length;
  }
  return code;
}

function findOptional(code, fromIndex){
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let templateExprDepth = 0;
  let inBlockComment = false;
  let inLineComment = false;
  let escape = false;
  for (let i = fromIndex; i < code.length - 1; i++){
    const ch = code[i];
    const next = code[i + 1];
    if (inLineComment){
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment){
      if (ch === '*' && next === '/'){
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inSingle){
      if (!escape && ch === '\\'){
        escape = true;
        continue;
      }
      if (!escape && ch === '\''){
        inSingle = false;
      }
      escape = false;
      continue;
    }
    if (inDouble){
      if (!escape && ch === '\\'){
        escape = true;
        continue;
      }
      if (!escape && ch === '"'){
        inDouble = false;
      }
      escape = false;
      continue;
    }
    if (inTemplate){
      if (!escape && ch === '`' && templateExprDepth === 0){
        inTemplate = false;
        continue;
      }
      if (!escape && ch === '$' && next === '{'){
        templateExprDepth++;
        i++;
        continue;
      }
      if (!escape && ch === '}' && templateExprDepth > 0){
        templateExprDepth--;
        continue;
      }
      if (!escape && ch === '\\'){
        escape = true;
        continue;
      }
      escape = false;
      continue;
    }
    if (ch === '/' && next === '*'){
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '/'){
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '\''){
      inSingle = true;
      escape = false;
      continue;
    }
    if (ch === '"'){
      inDouble = true;
      escape = false;
      continue;
    }
    if (ch === '`'){
      inTemplate = true;
      templateExprDepth = 0;
      escape = false;
      continue;
    }
    if (ch === '?' && next === '.'){
      return i;
    }
  }
  return -1;
}

function findNullish(code, fromIndex){
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let templateExprDepth = 0;
  let inBlockComment = false;
  let inLineComment = false;
  let escape = false;
  for (let i = fromIndex; i < code.length - 1; i++){
    const ch = code[i];
    const next = code[i + 1];
    if (inLineComment){
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment){
      if (ch === '*' && next === '/'){
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inSingle){
      if (!escape && ch === '\\'){
        escape = true;
        continue;
      }
      if (!escape && ch === '\''){
        inSingle = false;
      }
      escape = false;
      continue;
    }
    if (inDouble){
      if (!escape && ch === '\\'){
        escape = true;
        continue;
      }
      if (!escape && ch === '"'){
        inDouble = false;
      }
      escape = false;
      continue;
    }
    if (inTemplate){
      if (!escape && ch === '`' && templateExprDepth === 0){
        inTemplate = false;
        continue;
      }
      if (!escape && ch === '$' && next === '{'){
        templateExprDepth++;
        i++;
        continue;
      }
      if (!escape && ch === '}' && templateExprDepth > 0){
        templateExprDepth--;
        continue;
      }
      if (!escape && ch === '\\'){
        escape = true;
        continue;
      }
      escape = false;
      continue;
    }
    if (ch === '/' && next === '*'){
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '/'){
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '\''){
      inSingle = true;
      escape = false;
      continue;
    }
    if (ch === '"'){
      inDouble = true;
      escape = false;
      continue;
    }
    if (ch === '`'){
      inTemplate = true;
      templateExprDepth = 0;
      escape = false;
      continue;
    }
    if (ch === '?' && next === '?' && code[i + 2] !== '='){
      return i;
    }
  }
  return -1;
}

function replaceOptionalAt(code, pos){
  const left = extractLeftExpression(code, pos);
  if (!left.base){
    throw new Error('Failed to parse optional chaining base at index ' + pos);
  }
  const tail = parseOptionalTail(code, pos);
  let replacement;
  if (tail.type === 'property'){
    replacement = `(function (_temp){ return _temp == null ? void 0 : _temp.${tail.prop}; })(${left.base})`;
  } else if (tail.type === 'computed'){
    replacement = `(function (_temp){ return _temp == null ? void 0 : _temp[${tail.expr}]; })(${left.base})`;
  } else if (tail.type === 'call'){
    const member = parseMemberExpression(left.base);
    const argList = tail.args.trim();
    const callArgs = argList.length ? `, ${argList}` : '';
    if (member){
      if (member.computed){
        replacement = `(function (_obj){ var _func = _obj[${member.access}]; return _func == null ? void 0 : _func.call(_obj${callArgs}); })(${member.object})`;
      } else {
        replacement = `(function (_obj){ var _func = _obj.${member.property}; return _func == null ? void 0 : _func.call(_obj${callArgs}); })(${member.object})`;
      }
    } else {
      replacement = `(function (_func){ return _func == null ? void 0 : _func(${argList}); })(${left.base})`;
    }
  } else {
    throw new Error('Unknown optional tail type');
  }
  return { start: left.start, end: tail.end, replacement };
}

function replaceNullishAt(code, pos){
  const left = extractLeftExpression(code, pos);
  const right = extractRightExpression(code, pos);
  if (!left.base || !right.expr){
    throw new Error('Failed to parse nullish coalescing at index ' + pos);
  }
  const replacement = `(function (){ var _temp = ${left.base}; return _temp != null ? _temp : ${right.expr}; })()`;
  return { start: left.start, end: right.end, replacement };
}

function extractLeftExpression(code, pos){
  let i = pos - 1;
  while (i >= 0 && /\s/.test(code[i])) i--;
  let depthParen = 0;
  let depthBracket = 0;
  let depthBrace = 0;
  for (; i >= 0; i--){
    const ch = code[i];
    if (ch === ')'){
      depthParen++;
      continue;
    }
    if (ch === '('){
      if (depthParen > 0){
        depthParen--;
        continue;
      }
      break;
    }
    if (ch === ']'){
      depthBracket++;
      continue;
    }
    if (ch === '['){
      if (depthBracket > 0){
        depthBracket--;
        continue;
      }
      break;
    }
    if (ch === '}'){
      depthBrace++;
      continue;
    }
    if (ch === '{'){
      if (depthBrace > 0){
        depthBrace--;
        continue;
      }
      break;
    }
    if (depthParen > 0 || depthBracket > 0 || depthBrace > 0){
      continue;
    }
    if (/[_$A-Za-z0-9\.]/.test(ch)){
      continue;
    }
    if (!/\s/.test(ch)){
      break;
    }
  }
  const start = i + 1;
  const base = code.slice(start, pos).trim();
  return { start, base };
}

function parseOptionalTail(code, pos){
  let i = pos + 2;
  while (i < code.length && /\s/.test(code[i])) i++;
  const ch = code[i];
  if (ch === '['){
    const group = readGroup(code, i, '[', ']');
    return { type: 'computed', expr: group.content, end: group.end };
  }
  if (ch === '('){
    const group = readGroup(code, i, '(', ')');
    return { type: 'call', args: group.content, end: group.end };
  }
  let j = i;
  while (j < code.length && /[_$A-Za-z0-9]/.test(code[j])) j++;
  const prop = code.slice(i, j).trim();
  return { type: 'property', prop, end: j };
}

function extractRightExpression(code, pos){
  let i = pos + 2;
  while (i < code.length && /\s/.test(code[i])) i++;
  const start = i;
  let depthParen = 0;
  let depthBracket = 0;
  let depthBrace = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let templateExprDepth = 0;
  let escape = false;
  for (; i < code.length; i++){
    const ch = code[i];
    const next = code[i + 1];
    if (inSingle){
      if (!escape && ch === '\\'){
        escape = true;
        continue;
      }
      if (!escape && ch === '\''){
        inSingle = false;
        continue;
      }
      escape = false;
      continue;
    }
    if (inDouble){
      if (!escape && ch === '\\'){
        escape = true;
        continue;
      }
      if (!escape && ch === '"'){
        inDouble = false;
        continue;
      }
      escape = false;
      continue;
    }
    if (inTemplate){
      if (!escape && ch === '`' && templateExprDepth === 0){
        inTemplate = false;
        continue;
      }
      if (!escape && ch === '$' && next === '{'){
        templateExprDepth++;
        i++;
        continue;
      }
      if (!escape && ch === '}' && templateExprDepth > 0){
        templateExprDepth--;
        continue;
      }
      if (!escape && ch === '\\'){
        escape = true;
        continue;
      }
      escape = false;
      continue;
    }
    if (ch === '\''){
      inSingle = true;
      escape = false;
      continue;
    }
    if (ch === '"'){
      inDouble = true;
      escape = false;
      continue;
    }
    if (ch === '`'){
      inTemplate = true;
      templateExprDepth = 0;
      escape = false;
      continue;
    }
    if (ch === '('){
      depthParen++;
      continue;
    }
    if (ch === ')'){
      if (depthParen === 0) break;
      depthParen--;
      continue;
    }
    if (ch === '['){
      depthBracket++;
      continue;
    }
    if (ch === ']'){
      if (depthBracket === 0) break;
      depthBracket--;
      continue;
    }
    if (ch === '{'){
      depthBrace++;
      continue;
    }
    if (ch === '}'){
      if (depthBrace === 0) break;
      depthBrace--;
      continue;
    }
    if (depthParen === 0 && depthBracket === 0 && depthBrace === 0){
      if (ch === ';' || ch === ',' || ch === '\n') break;
      if (ch === '?' && next === '?') break;
      if (ch === ':') break;
    }
  }
  const end = i;
  const expr = code.slice(start, end).trim();
  return { start, end, expr };
}

function parseMemberExpression(expr){
  const trimmed = expr.trim();
  if (!trimmed) return null;
  if (trimmed.endsWith(']')){
    let depth = 0;
    for (let i = trimmed.length - 1; i >= 0; i--){
      const ch = trimmed[i];
      if (ch === ']'){
        depth++;
        continue;
      }
      if (ch === '['){
        depth--;
        if (depth === 0){
          const object = trimmed.slice(0, i).trim();
          const access = trimmed.slice(i + 1, trimmed.length - 1).trim();
          return { object, access, computed: true };
        }
        continue;
      }
    }
  }
  let depthParen = 0;
  for (let i = trimmed.length - 1; i >= 0; i--){
    const ch = trimmed[i];
    if (ch === ')'){
      depthParen++;
      continue;
    }
    if (ch === '('){
      if (depthParen > 0){
        depthParen--;
        continue;
      }
    }
    if (depthParen > 0) continue;
    if (ch === '.'){
      const object = trimmed.slice(0, i).trim();
      const property = trimmed.slice(i + 1).trim();
      return { object, property, computed: false };
    }
  }
  return null;
}

function readGroup(code, index, open, close){
  let i = index + 1;
  let depth = 1;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let templateExprDepth = 0;
  let escape = false;
  for (; i < code.length; i++){
    const ch = code[i];
    const next = code[i + 1];
    if (inSingle){
      if (!escape && ch === '\\'){
        escape = true;
        continue;
      }
      if (!escape && ch === '\''){
        inSingle = false;
        continue;
      }
      escape = false;
      continue;
    }
    if (inDouble){
      if (!escape && ch === '\\'){
        escape = true;
        continue;
      }
      if (!escape && ch === '"'){
        inDouble = false;
        continue;
      }
      escape = false;
      continue;
    }
    if (inTemplate){
      if (!escape && ch === '`' && templateExprDepth === 0){
        inTemplate = false;
        continue;
      }
      if (!escape && ch === '$' && next === '{'){
        templateExprDepth++;
        i++;
        continue;
      }
      if (!escape && ch === '}' && templateExprDepth > 0){
        templateExprDepth--;
        continue;
      }
      if (!escape && ch === '\\'){
        escape = true;
        continue;
      }
      escape = false;
      continue;
    }
    if (ch === '\''){
      inSingle = true;
      escape = false;
      continue;
    }
    if (ch === '"'){
      inDouble = true;
      escape = false;
      continue;
    }
    if (ch === '`'){
      inTemplate = true;
      templateExprDepth = 0;
      escape = false;
      continue;
    }
    if (ch === open){
      depth++;
      continue;
    }
    if (ch === close){
      depth--;
      if (depth === 0){
        break;
      }
      continue;
    }
  }
  if (depth !== 0){
    throw new Error('Unterminated group in optional chain parsing');
  }
  return { content: code.slice(index + 1, i), end: i + 1 };
}

module.exports = {
  transform
};
      
