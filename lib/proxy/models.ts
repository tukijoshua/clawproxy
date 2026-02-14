export interface ModelPricing {
  inputPricePerMillion: number
  outputPricePerMillion: number
  displayName: string
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // Google
  'google/gemini-2.0-flash-lite-001': { inputPricePerMillion: 0.075, outputPricePerMillion: 0.3, displayName: 'Flash-Lite' },
  'google/gemini-2.0-flash-001': { inputPricePerMillion: 0.1, outputPricePerMillion: 0.4, displayName: 'Gemini Flash' },
  // Anthropic
  'anthropic/claude-3.5-haiku': { inputPricePerMillion: 0.8, outputPricePerMillion: 4, displayName: 'Haiku 3.5' },
  'anthropic/claude-haiku-4-5': { inputPricePerMillion: 0.8, outputPricePerMillion: 4, displayName: 'Haiku 4.5' },
  'anthropic/claude-sonnet-4': { inputPricePerMillion: 3, outputPricePerMillion: 15, displayName: 'Sonnet 4' },
  'anthropic/claude-sonnet-4-5': { inputPricePerMillion: 3, outputPricePerMillion: 15, displayName: 'Sonnet 4.5' },
  'anthropic/claude-opus-4': { inputPricePerMillion: 15, outputPricePerMillion: 75, displayName: 'Opus 4' },
  'anthropic/claude-opus-4-6': { inputPricePerMillion: 15, outputPricePerMillion: 75, displayName: 'Opus 4.6' },
  // OpenAI
  'openai/gpt-4o': { inputPricePerMillion: 2.5, outputPricePerMillion: 10, displayName: 'GPT-4o' },
  'openai/gpt-4o-mini': { inputPricePerMillion: 0.15, outputPricePerMillion: 0.6, displayName: 'GPT-4o Mini' },
  'openai/gpt-4.1': { inputPricePerMillion: 2, outputPricePerMillion: 8, displayName: 'GPT-4.1' },
  'openai/gpt-4.1-mini': { inputPricePerMillion: 0.4, outputPricePerMillion: 1.6, displayName: 'GPT-4.1 Mini' },
  'openai/gpt-4.1-nano': { inputPricePerMillion: 0.1, outputPricePerMillion: 0.4, displayName: 'GPT-4.1 Nano' },
  // Meta
  'meta-llama/llama-3.3-70b-instruct': { inputPricePerMillion: 0.39, outputPricePerMillion: 0.39, displayName: 'Llama 3.3 70B' },
  // DeepSeek
  'deepseek/deepseek-chat-v3': { inputPricePerMillion: 0.27, outputPricePerMillion: 1.1, displayName: 'DeepSeek V3' },
}

export const DEFAULT_PRICING: ModelPricing = {
  inputPricePerMillion: 1,
  outputPricePerMillion: 3,
  displayName: 'Unknown',
}

export function getModelPricing(model: string): ModelPricing {
  return MODEL_PRICING[model] ?? MODEL_PRICING[normalizeModelId(model)] ?? DEFAULT_PRICING
}

/**
 * Prefix patterns — maps bare model name prefixes to their OpenRouter provider.
 * Order matters: more specific prefixes first to avoid false matches.
 */
const PROVIDER_PREFIXES: Array<{ prefix: string; provider: string }> = [
  // Anthropic
  { prefix: 'claude-', provider: 'anthropic' },
  // OpenAI
  { prefix: 'gpt-', provider: 'openai' },
  { prefix: 'o1-', provider: 'openai' },
  { prefix: 'o3-', provider: 'openai' },
  { prefix: 'chatgpt-', provider: 'openai' },
  // Google
  { prefix: 'gemini-', provider: 'google' },
  { prefix: 'gemma-', provider: 'google' },
  // Meta
  { prefix: 'llama-', provider: 'meta-llama' },
  // DeepSeek
  { prefix: 'deepseek-', provider: 'deepseek' },
  // Mistral
  { prefix: 'mistral-', provider: 'mistralai' },
  { prefix: 'mixtral-', provider: 'mistralai' },
]

/**
 * Strips version date suffixes from model names so they match OpenRouter IDs.
 * e.g. "claude-opus-4-0-20250514" → "claude-opus-4"
 *      "claude-sonnet-4-5-20250929" → "claude-sonnet-4-5"
 *      "gpt-4o-2024-08-06" → "gpt-4o"
 */
function stripVersionSuffix(model: string): string {
  let s = model
  // Anthropic-style: -YYYYMMDD (8 consecutive digits at end)
  s = s.replace(/-\d{8}$/, '')
  // Minor version 0 equals the base model: claude-opus-4-0 → claude-opus-4
  s = s.replace(/-0$/, '')
  // OpenAI-style: -YYYY-MM-DD
  s = s.replace(/-\d{4}-\d{2}-\d{2}$/, '')
  return s
}

/**
 * Normalizes a model ID to a valid OpenRouter model ID.
 * 1. Adds provider prefix if missing  (claude-opus-4 → anthropic/claude-opus-4)
 * 2. Strips version date suffixes      (claude-opus-4-0-20250514 → claude-opus-4)
 */
export function normalizeModelId(model: string): string {
  // Already has a provider prefix
  if (model.includes('/')) {
    const slashIdx = model.indexOf('/')
    const provider = model.slice(0, slashIdx)
    const modelName = model.slice(slashIdx + 1)

    // "clawproxy/" is our own provider alias — strip it and re-normalize the bare model name
    if (provider === 'clawproxy') {
      return normalizeModelId(modelName)
    }

    if (MODEL_PRICING[model]) return model
    // Try stripping version suffix from the model name part
    const stripped = stripVersionSuffix(modelName)
    if (stripped !== modelName) return `${provider}/${stripped}`
    return model
  }

  // Try to match a known prefix
  for (const { prefix, provider } of PROVIDER_PREFIXES) {
    if (model.startsWith(prefix)) {
      const fullId = `${provider}/${model}`
      if (MODEL_PRICING[fullId]) return fullId
      // Strip version suffix and return
      return `${provider}/${stripVersionSuffix(model)}`
    }
  }

  // Unknown bare model — return as-is and let OpenRouter handle it
  return model
}
