import {
  MAX_MARGIN_PERCENT,
  MAX_TOTAL_PERCENT_BEFORE_DIVISION,
  MIN_CLINICAL_TIME_MINUTES,
  MIN_HOURLY_CLINICAL_COST,
  PRECISION,
} from './constants'
import type {
  PrecificacaoCalculationResult,
  PrecificacaoCurrentPriceStatus,
  PrecificacaoInput,
} from './types'

// ── Helpers de arredondamento ──────────────────────────────────────────

function roundToPrecision(value: number, precision = PRECISION): number {
  const factor = Math.pow(10, precision)
  return Math.round(value * factor) / factor
}

function roundCurrency(value: number): number {
  return roundToPrecision(value)
}

function roundPercent(value: number): number {
  return roundToPrecision(value)
}

function normalizeOptionalText(value?: string): string | undefined {
  if (value === undefined || value === null) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

// ── Validação ──────────────────────────────────────────────────────────

function validatePrecificacaoInput(input: PrecificacaoInput): void {
  if (input.materialCost < 0) {
    throw new Error('O custo de materiais deve ser maior ou igual a zero.')
  }
  if (input.labCost < 0) {
    throw new Error('O custo de laboratório deve ser maior ou igual a zero.')
  }
  if (input.clinicalTimeMinutes < MIN_CLINICAL_TIME_MINUTES) {
    throw new Error('O tempo clínico deve ser maior que zero.')
  }
  if (input.hourlyClinicalCost < MIN_HOURLY_CLINICAL_COST) {
    throw new Error('O custo da hora clínica deve ser maior que zero.')
  }
  if (input.cardFeePercent < 0) {
    throw new Error('A taxa da maquininha deve ser maior ou igual a zero.')
  }
  if (input.taxPercent < 0) {
    throw new Error('A alíquota de impostos deve ser maior ou igual a zero.')
  }
  if (input.desiredMarginPercent < 0) {
    throw new Error('A margem desejada deve ser maior ou igual a zero.')
  }
  if (input.desiredMarginPercent >= MAX_MARGIN_PERCENT) {
    throw new Error('A margem desejada deve ser menor que 95%.')
  }
  if (input.currentPrice !== undefined && input.currentPrice <= 0) {
    throw new Error('O preço atual deve ser maior que zero quando informado.')
  }

  const deductionPercent = input.cardFeePercent + input.taxPercent

  if (deductionPercent >= MAX_TOTAL_PERCENT_BEFORE_DIVISION) {
    throw new Error('A soma de taxas e impostos deve ser menor que 100%.')
  }
  if (deductionPercent + input.desiredMarginPercent >= MAX_TOTAL_PERCENT_BEFORE_DIVISION) {
    throw new Error(
      'A soma de taxas, impostos e margem desejada deve ser menor que 100%.',
    )
  }
}

// ── Função principal ───────────────────────────────────────────────────

export function calculatePrecificacao(
  input: PrecificacaoInput,
): PrecificacaoCalculationResult {
  validatePrecificacaoInput(input)

  const {
    clinicalTimeMinutes,
    hourlyClinicalCost,
    cardFeePercent,
    taxPercent,
    desiredMarginPercent,
    currentPrice,
  } = input

  // Normalização defensiva
  const materialCost = roundCurrency(input.materialCost)
  const labCost = roundCurrency(input.labCost ?? 0)
  const procedureName = normalizeOptionalText(input.procedureName)

  // Tempo clínico
  const clinicalTimeHours = roundToPrecision(clinicalTimeMinutes / 60)
  const clinicalTimeCost = roundCurrency(clinicalTimeHours * hourlyClinicalCost)

  // Custo total direto
  const directCost = roundCurrency(materialCost + labCost + clinicalTimeCost)

  // Percentual total de deduções (taxas + impostos, sem margem)
  const deductionPercent = roundPercent(cardFeePercent + taxPercent)

  // Preço mínimo — cobre directCost absorvendo deduções, sem lucro
  const minimumPrice = roundCurrency(directCost / (1 - deductionPercent / 100))

  // Preço sugerido — cobre directCost, deduções e margem desejada
  const suggestedPrice = roundCurrency(
    directCost / (1 - (deductionPercent + desiredMarginPercent) / 100),
  )

  // Valor das deduções (taxas + impostos) calculado sobre o preço sugerido
  const deductionAmount = roundCurrency(suggestedPrice * (deductionPercent / 100))

  // Lucro estimado após custos e deduções
  const estimatedProfit = roundCurrency(suggestedPrice - directCost - deductionAmount)

  // Margem real estimada sobre o preço sugerido
  const estimatedMarginPercent = roundPercent(
    (estimatedProfit / suggestedPrice) * 100,
  )

  // Base do resultado (sem campos de currentPrice)
  const base: PrecificacaoCalculationResult = {
    ...(procedureName !== undefined ? { procedureName } : {}),
    materialCost,
    labCost,
    clinicalTimeMinutes,
    hourlyClinicalCost,
    cardFeePercent,
    taxPercent,
    desiredMarginPercent,
    clinicalTimeHours,
    clinicalTimeCost,
    directCost,
    deductionPercent,
    minimumPrice,
    suggestedPrice,
    deductionAmount,
    estimatedProfit,
    estimatedMarginPercent,
  }

  // Comparação com preço atual — calculada somente quando currentPrice informado
  if (currentPrice === undefined) {
    return base
  }

  const roundedCurrentPrice = roundCurrency(currentPrice)

  // priceGap: positivo quando atual > sugerido, negativo quando abaixo
  const priceGap = roundCurrency(roundedCurrentPrice - suggestedPrice)
  const priceGapPercent = roundPercent((priceGap / suggestedPrice) * 100)

  const currentPriceStatus: PrecificacaoCurrentPriceStatus =
    roundedCurrentPrice >= suggestedPrice
      ? 'healthy'
      : roundedCurrentPrice >= minimumPrice
        ? 'belowSuggested'
        : 'belowMinimum'

  return {
    ...base,
    currentPrice: roundedCurrentPrice,
    priceGap,
    priceGapPercent,
    currentPriceStatus,
  }
}
