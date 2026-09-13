import type { LanguageModelUsage } from 'ai';
import { describe, expect, it } from 'vitest';
import { type ContextProviders, estimateContextCosts } from './context-cost';

const usage: LanguageModelUsage = {
  inputTokens: 1000,
  inputTokenDetails: {
    noCacheTokens: 700,
    cacheReadTokens: 200,
    cacheWriteTokens: 100,
  },
  outputTokens: 500,
  outputTokenDetails: { textTokens: 400, reasoningTokens: 100 },
  totalTokens: 1500,
};
const providers: ContextProviders = {
  id: 'test',
  models: {
    example: {
      id: 'example',
      name: 'Example',
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
describe('AI SDK usage pricing', () => {
  it('prices inclusive counters without charging reasoning or caching twice', async () => {
    const cost = await estimateContextCosts('test/example', usage, providers);
    expect(cost.inputUSD).toBeCloseTo(0.0018);
    expect(cost.outputUSD).toBeCloseTo(0.0024);
    expect(cost.reasoningUSD).toBeCloseTo(0.0008);
    expect(cost.cacheReadUSD).toBeCloseTo(0.0001);
    expect(cost.cacheWriteUSD).toBeCloseTo(0.0003);
    expect(cost.totalUSD).toBeCloseTo(0.0042);
    const derived = await estimateContextCosts(
      'test/example',
      {
        ...usage,
        inputTokenDetails: {
          ...usage.inputTokenDetails,
          noCacheTokens: undefined,
        },
        outputTokenDetails: {
          ...usage.outputTokenDetails,
          textTokens: undefined,
        },
      },
      providers,
    );
    expect(derived).toEqual(cost);
  });
  it('uses the output rate when reasoning has no separate price and does not present partial totals as complete', async () => {
    const catalog = {
      id: 'test',
      models: {
        example: {
          id: 'example',
          name: 'Example',
          cost: { input: 2, output: 4, cache_read: 0.5, cache_write: 3 },
        },
      },
    };
    const cost = await estimateContextCosts('test/example', usage, catalog);
    expect(cost.outputUSD).toBeCloseTo(0.002);
    expect(cost.reasoningUSD).toBeCloseTo(0.0004);
    expect(cost.totalUSD).toBeCloseTo(0.0038);
    const incomplete = await estimateContextCosts('test/example', usage, {
      id: 'test',
      models: {
        example: {
          id: 'example',
          name: 'Example',
          cost: { input: 2, output: 4 },
        },
      },
    });
    expect(incomplete.inputUSD).toBeUndefined();
    expect(incomplete.outputUSD).toBeCloseTo(0.002);
    expect(incomplete.totalUSD).toBeUndefined();
    expect(
      await estimateContextCosts('test/unknown', usage, providers),
    ).toEqual({});
  });
  it('honors a provider prefix when different providers offer the same model name', async () => {
    const other = {
      id: 'other',
      models: {
        example: {
          id: 'example',
          name: 'Other',
          cost: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
        },
      },
    };
    const catalog = { other, test: providers } as ContextProviders;
    expect(
      (await estimateContextCosts('test:example', usage, catalog)).totalUSD,
    ).toBeCloseTo(0.0042);
    expect(
      (await estimateContextCosts('other/example', usage, catalog)).totalUSD,
    ).toBe(0);
    expect(
      await estimateContextCosts('missing/example', usage, catalog),
    ).toEqual({});
    expect(await estimateContextCosts('missing/example', usage)).toEqual({});
  });
  it('distinguishes missing usage from free usage and rejects contradictory or invalid counters', async () => {
    const absent = await estimateContextCosts(
      'test/example',
      { ...usage, inputTokens: undefined },
      providers,
    );
    expect(absent.totalUSD).toBeUndefined();
    const free = await estimateContextCosts('test/example', usage, {
      id: 'test',
      models: {
        example: {
          id: 'example',
          name: 'Free',
          cost: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
        },
      },
    });
    expect(free.totalUSD).toBe(0);
    for (const inputTokens of [-1, Number.NaN, Number.POSITIVE_INFINITY, 900]) {
      expect(
        await estimateContextCosts(
          'test/example',
          { ...usage, inputTokens },
          providers,
        ),
      ).toEqual({});
    }
  });
});
