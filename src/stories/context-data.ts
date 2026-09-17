import type { LanguageModelUsage } from 'ai';
import type { ContextProviders } from '../Context/context-cost';

/** Fictional rates for deterministic demos; not a provider price list. */
export const contextDemoProviders: ContextProviders = {
  id: 'demo',
  models: {
    assistant: {
      id: 'assistant',
      name: 'Demo assistant',
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
export const contextDemoUsage: LanguageModelUsage = {
  inputTokens: 10000,
  inputTokenDetails: {
    noCacheTokens: 7000,
    cacheReadTokens: 2000,
    cacheWriteTokens: 1000,
  },
  outputTokens: 5000,
  outputTokenDetails: { textTokens: 4000, reasoningTokens: 1000 },
  totalTokens: 15000,
};
export interface ContextDemoMetadata {
  usage: LanguageModelUsage;
  modelId: string;
  maxTokens: number;
}
