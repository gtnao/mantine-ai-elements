/* Adapted from AI Elements (Apache-2.0). See NOTICE. */

// Expressions remain opaque: completing JavaScript could change its meaning.
// An unfinished expression is omitted until the next stream update.
function expressionEnd(source: string, start: number): number {
  let depth = 1;
  let quote = '';
  for (let i = start + 1; i < source.length; i++) {
    const char = source[i];
    if (quote) {
      if (char === '\\') i++;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
    } else if (char === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      if (end === -1) return -1;
      i = end + 1;
    } else if (char === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i + 2);
      if (end === -1) return -1;
      i = end;
    } else if (char === '{') depth++;
    else if (char === '}' && --depth === 0) return i + 1;
  }
  return -1;
}

function tagEnd(source: string, start: number): number {
  let quote = '';
  for (let i = start + 1; i < source.length; i++) {
    const char = source[i];
    if (quote) {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '{') {
      const end = expressionEnd(source, i);
      if (end === -1) return -1;
      i = end - 1;
    } else if (char === '>') return i + 1;
  }
  return -1;
}

/** Best-effort streaming completion, not JSX validation or sanitization. */
export function completeJsx(source: string): string {
  const stack: string[] = [];
  let position = 0;
  let end = source.length;
  while (position < source.length) {
    if (source[position] === '{') {
      const next = expressionEnd(source, position);
      if (next === -1) {
        end = position;
        break;
      }
      position = next;
    } else if (source[position] === '<') {
      const next = tagEnd(source, position);
      if (next === -1) {
        end = position;
        break;
      }
      const tag = source.slice(position, next);
      const match = /^<(\/)?([A-Za-z][\w.:-]*|)(?=[\s/>])/.exec(tag);
      if (match) {
        const name = match[2];
        if (match[1]) {
          // Do not conceal mismatched closing tags; the parser reports them.
          if (stack.at(-1) !== name) return source;
          stack.pop();
        } else if (!/\/\s*>$/.test(tag)) stack.push(name);
      }
      position = next;
    } else position++;
  }
  return (
    source.slice(0, end) +
    stack
      .reverse()
      .map((name) => `</${name}>`)
      .join('')
  );
}
