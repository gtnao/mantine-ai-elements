import type { BundledLanguage, ThemedToken } from 'shiki';

export type CodeBlockLanguage =
  | BundledLanguage
  | 'text'
  | 'plaintext'
  | (string & {});
export interface TokenizedCode {
  tokens: ThemedToken[][];
  fg: string;
  bg: string;
}
const cache = new Map<string, TokenizedCode>();
const pending = new Map<string, Promise<TokenizedCode>>();
const keyFor = (code: string, language: string) =>
  JSON.stringify([language, code]);

/** Loads only the requested language and reuses Shiki's singleton highlighter. */
export function highlightCodeAsync(
  code: string,
  language: CodeBlockLanguage,
): Promise<TokenizedCode> {
  const key = keyFor(code, language);
  const cached = cache.get(key);
  if (cached) return Promise.resolve(cached);
  const existing = pending.get(key);
  if (existing) return existing;
  const request = import('shiki')
    .then(async ({ codeToTokens, bundledLanguages }) => {
      const lang =
        language in bundledLanguages ? (language as BundledLanguage) : 'text';
      const result = await codeToTokens(code, {
        lang,
        themes: { light: 'github-light', dark: 'github-dark' },
      });
      const tokenized = {
        tokens: result.tokens,
        fg: result.fg ?? 'inherit',
        bg: result.bg ?? 'transparent',
      };
      // Do not retain arbitrarily large streaming responses in a module cache.
      if (code.length <= 100_000) {
        if (cache.size >= 100) {
          const oldest = cache.keys().next().value;
          if (oldest !== undefined) cache.delete(oldest);
        }
        cache.set(key, tokenized);
      }
      return tokenized;
    })
    .finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}

/** Returns cached tokens immediately; otherwise delivers tokens through callback. */
export function highlightCode(
  code: string,
  language: CodeBlockLanguage,
  callback?: (result: TokenizedCode) => void,
  onError?: (error: unknown) => void,
): TokenizedCode | null {
  const cached = cache.get(keyFor(code, language));
  if (cached) return cached;
  void highlightCodeAsync(code, language).then(callback, onError ?? (() => {}));
  return null;
}
