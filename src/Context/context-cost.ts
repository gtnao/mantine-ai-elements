import type { LanguageModelUsage } from 'ai';
import type { ProviderInfo, ProvidersCatalog, TokenBreakdown } from 'tokenlens';

export type ContextProviders = ProvidersCatalog | ProviderInfo;
/** Input and output include their respective cache/reasoning subsets. */
export interface ContextCosts {
  inputUSD?: number;
  outputUSD?: number;
  reasoningUSD?: number;
  cacheReadUSD?: number;
  cacheWriteUSD?: number;
  totalUSD?: number;
}
export function validCount(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}
function sum(...values: (number | undefined)[]) {
  return values.every(validCount)
    ? values.reduce<number>((total, value) => total + (value ?? 0), 0)
    : undefined;
}
/** Adapt inclusive AI SDK counters to Tokenlens's disjoint pricing categories. */
export async function estimateContextCosts(
  modelId: string,
  usage: LanguageModelUsage,
  providers?: ContextProviders,
): Promise<ContextCosts> {
  const module = await import('tokenlens/helpers');
  const catalog: ContextProviders =
    providers ?? (await import('tokenlens/models')).getModels();
  const isProvider = (value: ContextProviders): value is ProviderInfo =>
    typeof value.id === 'string' && typeof value.models === 'object';
  const separator = modelId.search(/[:/]/);
  const providerId = separator > 0 ? modelId.slice(0, separator) : undefined;
  const selected = providerId
    ? isProvider(catalog)
      ? catalog.id === providerId
        ? catalog
        : undefined
      : catalog[providerId]
    : catalog;
  if (!selected) return {};
  const calculate = (tokens: TokenBreakdown) =>
    module.getTokenCosts({
      modelId,
      usage: tokens,
      providers: selected,
    });
  const input = usage.inputTokens;
  const output = usage.outputTokens;
  const reads = usage.inputTokenDetails.cacheReadTokens ?? 0;
  const writes = usage.inputTokenDetails.cacheWriteTokens ?? 0;
  const reasoning = usage.outputTokenDetails.reasoningTokens ?? 0;
  const noCache =
    usage.inputTokenDetails.noCacheTokens ??
    (input === undefined ? undefined : input - reads - writes);
  const text =
    usage.outputTokenDetails.textTokens ??
    (output === undefined ? undefined : output - reasoning);
  const counts = [input, output, reads, writes, reasoning, noCache, text];
  if (counts.some((value) => value !== undefined && !validCount(value)))
    return {};
  if (
    input !== undefined &&
    noCache !== undefined &&
    noCache + reads + writes !== input
  )
    return {};
  if (output !== undefined && text !== undefined && text + reasoning !== output)
    return {};
  const rates = calculate({
    input: 0,
    output: 0,
    cacheReads: 0,
    cacheWrites: 0,
    reasoningTokens: 0,
  });
  if (
    [
      rates.inputUSD,
      rates.outputUSD,
      rates.reasoningUSD,
      rates.cacheReadUSD,
      rates.cacheWriteUSD,
    ].every((value) => value === undefined)
  )
    return {};
  const separateReasoning = rates.reasoningUSD !== undefined;
  const cost = calculate({
    input: noCache ?? 0,
    output: separateReasoning ? (text ?? 0) : (output ?? 0),
    cacheReads: reads,
    cacheWrites: writes,
    reasoningTokens: separateReasoning ? reasoning : 0,
  });
  const readUSD = reads === 0 ? 0 : cost.cacheReadUSD;
  const writeUSD = writes === 0 ? 0 : cost.cacheWriteUSD;
  const reasoningUSD =
    reasoning === 0
      ? 0
      : separateReasoning
        ? cost.reasoningUSD
        : calculate({ input: 0, output: reasoning }).outputUSD;
  const inputUSD =
    input === undefined
      ? undefined
      : sum(noCache === 0 ? 0 : cost.inputUSD, readUSD, writeUSD);
  const outputUSD =
    output === undefined
      ? undefined
      : separateReasoning
        ? sum(text === 0 ? 0 : cost.outputUSD, reasoningUSD)
        : output === 0
          ? 0
          : cost.outputUSD;
  return {
    inputUSD,
    outputUSD,
    reasoningUSD,
    cacheReadUSD: readUSD,
    cacheWriteUSD: writeUSD,
    totalUSD: sum(inputUSD, outputUSD),
  };
}
