import type { ComponentType, ElementType } from 'react';

export interface JSXPreviewComponents {
  [name: string]: ElementType | JSXPreviewComponents;
}

export interface PreviewParserProps {
  jsx: string;
  components?: JSXPreviewComponents;
  bindings?: Record<string, unknown>;
  onError: (error: Error) => void;
  renderInWrapper: false;
}

export async function loadPreviewParser() {
  const { default: Parser } = await import('react-jsx-parser');
  // react-jsx-parser 2.4 externalizes React and supports React >=18 at runtime,
  // but its declarations still reference optional React 18 types. Keep that
  // mismatch private; the public contract uses the consumer's React types.
  return { default: Parser as unknown as ComponentType<PreviewParserProps> };
}
