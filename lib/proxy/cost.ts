import { getModelPricing } from './models'

export function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
): { cost: number; displayName: string } {
  const pricing = getModelPricing(model)
  const cost =
    (promptTokens / 1_000_000) * pricing.inputPricePerMillion +
    (completionTokens / 1_000_000) * pricing.outputPricePerMillion
  return { cost, displayName: pricing.displayName }
}

export function calculateEstimatedDirectCost(
  requestedModel: string | null,
  actualModel: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const model = requestedModel ?? actualModel
  const pricing = getModelPricing(model)
  return (
    (promptTokens / 1_000_000) * pricing.inputPricePerMillion +
    (completionTokens / 1_000_000) * pricing.outputPricePerMillion
  )
}
