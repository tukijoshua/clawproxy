export interface ModelPricing {
  inputPricePerMillion: number
  outputPricePerMillion: number
  displayName: string
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  'google/gemini-2.0-flash-lite-001': { inputPricePerMillion: 0.075, outputPricePerMillion: 0.3, displayName: 'Flash-Lite' },
  'google/gemini-2.0-flash-001': { inputPricePerMillion: 0.1, outputPricePerMillion: 0.4, displayName: 'Gemini Flash' },
  'anthropic/claude-3.5-haiku': { inputPricePerMillion: 0.8, outputPricePerMillion: 4, displayName: 'Haiku 3.5' },
  'anthropic/claude-haiku-4-5': { inputPricePerMillion: 0.8, outputPricePerMillion: 4, displayName: 'Haiku 4.5' },
  'anthropic/claude-sonnet-4': { inputPricePerMillion: 3, outputPricePerMillion: 15, displayName: 'Sonnet 4' },
  'anthropic/claude-sonnet-4-5': { inputPricePerMillion: 3, outputPricePerMillion: 15, displayName: 'Sonnet 4.5' },
  'anthropic/claude-opus-4': { inputPricePerMillion: 15, outputPricePerMillion: 75, displayName: 'Opus 4' },
  'anthropic/claude-opus-4-6': { inputPricePerMillion: 15, outputPricePerMillion: 75, displayName: 'Opus 4.6' },
  'openai/gpt-4o': { inputPricePerMillion: 2.5, outputPricePerMillion: 10, displayName: 'GPT-4o' },
  'openai/gpt-4o-mini': { inputPricePerMillion: 0.15, outputPricePerMillion: 0.6, displayName: 'GPT-4o Mini' },
  'openai/gpt-4.1': { inputPricePerMillion: 2, outputPricePerMillion: 8, displayName: 'GPT-4.1' },
  'openai/gpt-4.1-mini': { inputPricePerMillion: 0.4, outputPricePerMillion: 1.6, displayName: 'GPT-4.1 Mini' },
  'openai/gpt-4.1-nano': { inputPricePerMillion: 0.1, outputPricePerMillion: 0.4, displayName: 'GPT-4.1 Nano' },
  'meta-llama/llama-3.3-70b-instruct': { inputPricePerMillion: 0.39, outputPricePerMillion: 0.39, displayName: 'Llama 3.3 70B' },
  'deepseek/deepseek-chat-v3': { inputPricePerMillion: 0.27, outputPricePerMillion: 1.1, displayName: 'DeepSeek V3' },
}

export const DEFAULT_PRICING: ModelPricing = {
  inputPricePerMillion: 1,
  outputPricePerMillion: 3,
  displayName: 'Unknown',
}

export function getModelPricing(model: string): ModelPricing {
  return MODEL_PRICING[model] ?? DEFAULT_PRICING
}
