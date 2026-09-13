import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';
import { completeJsx } from './complete-jsx';
import { loadPreviewParser } from './parser-adapter';

let JsxParser: Awaited<ReturnType<typeof loadPreviewParser>>['default'];
beforeAll(async () => {
  JsxParser = (await loadPreviewParser()).default;
});

function preview(source: string) {
  const errors: Error[] = [];
  const html = renderToStaticMarkup(
    createElement(JsxParser, {
      jsx: completeJsx(source),
      renderInWrapper: false,
      onError: (error: Error) => errors.push(error),
    }),
  );
  expect(errors).toEqual([]);
  return html;
}

describe('streaming JSX completion', () => {
  it('renders partial text and keeps quoted greater-than signs inside attributes', () => {
    expect(preview('<section><p title="a > b">Hello')).toBe(
      '<section><p title="a &gt; b">Hello</p></section>',
    );
    expect(preview('<section><p>Ready</p><span title="unfinished >')).toBe(
      '<section><p>Ready</p></section>',
    );
  });

  it('preserves complete expressions and omits unfinished expressions without evaluating guesses', () => {
    expect(preview('<div>{1 < 2 ? "yes" : "no"}<span>Next')).toBe(
      '<div>yes<span>Next</span></div>',
    );
    expect(preview('<div>Count: {1 +')).toBe('<div>Count: </div>');
    // The parser rejects JSXEmptyExpression; completion must still leave
    // comments intact and ignore tag-looking text inside them.
    expect(completeJsx('<div>{/* ignore <Fake> */}OK')).toBe(
      '<div>{/* ignore <Fake> */}OK</div>',
    );
    expect(preview('<div>{"<not-a-tag>"}')).toBe(
      '<div>&lt;not-a-tag&gt;</div>',
    );
  });

  it('handles fragments, member components and custom-element names without hiding invalid closings', () => {
    expect(preview('<><p>One</p><p>Two')).toBe('<p>One</p><p>Two</p>');
    expect(completeJsx('<UI.Card><my-label>Text')).toBe(
      '<UI.Card><my-label>Text</my-label></UI.Card>',
    );
    expect(completeJsx('<div><span /></div>')).toBe('<div><span /></div>');
    expect(completeJsx('<div></p>')).toBe('<div></p>');
  });
});
