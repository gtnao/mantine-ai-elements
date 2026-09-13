'use client';
import { useChat } from '@ai-sdk/react';
import { Button, Stack, Text } from '@mantine/core';
import type { LanguageModelUsage } from 'ai';
import {
  Context,
  type ContextCosts,
  type ContextProviders,
} from 'mantine-ai-elements';
import { useState } from 'react';
import { createDemoTransport } from './demo-transport';

const usage: LanguageModelUsage = {
  inputTokens: 10000,
  outputTokens: 5000,
  totalTokens: 15000,
  inputTokenDetails: {
    noCacheTokens: 7000,
    cacheReadTokens: 2000,
    cacheWriteTokens: 1000,
  },
  outputTokenDetails: { textTokens: 4000, reasoningTokens: 1000 },
};
const providers: ContextProviders = {
  id: 'demo',
  models: {
    assistant: {
      id: 'assistant',
      name: 'Demo',
      cost: {
        input: 2,
        output: 4,
        reasoning: 8,
        cache_read: 0.5,
        cache_write: 3,
      },
    },
  },
};
const override: ContextCosts = { totalUSD: 1.25 };
export default function ContextExample() {
  const [transport] = useState(() =>
    createDemoTransport({ metadata: { usage } }),
  );
  const chat = useChat({ transport });
  const reported = chat.messages.at(-1)?.metadata?.usage;
  return (
    <Stack data-testid="context-example">
      <Button
        disabled={chat.status === 'streaming' || chat.status === 'submitted'}
        onClick={() => void chat.sendMessage({ text: 'Report usage' })}
      >
        Report usage
      </Button>
      {reported ? (
        <Context
          usedTokens={reported.totalTokens ?? 0}
          maxTokens={32000}
          usage={reported}
          modelId="demo/assistant"
          providers={providers}
          styles={{ footer: { padding: 21 } }}
          transitionProps={{ duration: 0 }}
        >
          <Context.Trigger />
          <Context.Content>
            <Context.ContentHeader />
            <Context.ContentBody>
              <Context.InputUsage />
              <Context.OutputUsage />
              <Context.ReasoningUsage />
              <Context.CacheUsage />
            </Context.ContentBody>
            <Context.ContentFooter />
          </Context.Content>
        </Context>
      ) : (
        <Text>Usage pending</Text>
      )}
      <Context
        usedTokens={1}
        maxTokens={10}
        costUSD={override}
        transitionProps={{ duration: 0 }}
      >
        <Context.Trigger>Server cost</Context.Trigger>
        <Context.Content>
          <Context.ContentFooter />
        </Context.Content>
      </Context>
      <Context
        usedTokens={15000}
        maxTokens={128000}
        usage={{
          ...usage,
          inputTokenDetails: {
            noCacheTokens: 10000,
            cacheReadTokens: 0,
            cacheWriteTokens: 0,
          },
          outputTokenDetails: { textTokens: 5000, reasoningTokens: 0 },
        }}
        modelId="openai/gpt-4o"
        transitionProps={{ duration: 0 }}
      >
        <Context.Trigger>Bundled catalog</Context.Trigger>
        <Context.Content>
          <Context.ContentFooter />
        </Context.Content>
      </Context>
      <Context
        usedTokens={1}
        maxTokens={10}
        usage={usage}
        modelId="unknown/example"
        transitionProps={{ duration: 0 }}
      >
        <Context.Trigger>Unknown model</Context.Trigger>
        <Context.Content>
          <Context.ContentFooter />
        </Context.Content>
      </Context>
    </Stack>
  );
}
