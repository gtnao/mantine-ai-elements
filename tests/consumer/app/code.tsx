'use client';
import { CodeBlock } from 'mantine-ai-elements';
import { useState } from 'react';
export default function CodeExample() {
  const [language, setLanguage] = useState<string | null>('typescript');
  return (
    <CodeBlock
      mt="xl"
      data-testid="code-example"
      code={
        language === 'python' ? 'print("Hello")' : 'const greeting = "Hello";'
      }
      language={language ?? 'text'}
      showLineNumbers
    >
      <CodeBlock.Header>
        <CodeBlock.Filename>Example</CodeBlock.Filename>
        <CodeBlock.Actions>
          <CodeBlock.LanguageSelector
            w={140}
            value={language}
            onChange={setLanguage}
            data={['typescript', 'python']}
          />
          <CodeBlock.CopyButton />
        </CodeBlock.Actions>
      </CodeBlock.Header>
    </CodeBlock>
  );
}
