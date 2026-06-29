import {
  DEFAULT_DESIRED_PROFIT_MARGIN_PERCENT,
  DEFAULT_FIXED_COST_ALLOCATION,
  MAX_DESIRED_PROFIT_MARGIN_PERCENT,
  MIN_FIXED_COST_ALLOCATION,
  MIN_HOURLY_CLINICAL_COST,
  MIN_PROCEDURE_DURATION_MINUTES,
  MIN_PROCEDURE_PRICE,
  MIN_PROCEDURE_VARIABLE_COST,
  PRECISION,
} from './constants'
import type {
  RentabilidadeProcedimentoCalculationResult,
  RentabilidadeProcedimentoInput,
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

function roundHours(value: number): number {
  return roundToPrecision(value)
}

// ── Validação ──────────────────────────────────────────────────────────

function validateInput(input: RentabilidadeProcedimentoInput): void {
  if (input.procedurePrice < MIN_PROCEDURE_PRICE) {
    throw new Error('O preço do procedimento deve ser maior que zero.')
  }
  if (input.procedureVariableCost < MIN_PROCEDURE_VARIABLE_COST) {
    throw new Error('O custo variável do procedimento deve ser maior ou igual a zero.')
  }
  if (input.procedureDurationMinutes < MIN_PROCEDURE_DURATION_MINUTES) {
    throw new Error('O tempo do procedimento deve ser maior que zero.')
  }
  if (input.hourlyClinicalCost < MIN_HOURLY_CLINICAL_COST) {
    throw new Error('O custo da hora clínica deve ser maior que zero.')
  }
  const fixedCost = input.fixedCostAllocation ?? DEFAULT_FIXED_COST_ALLOCATION
  if (fixedCost < MIN_FIXED_COST_ALLOCATION) {
    throw new Error('A alocação de custo fixo deve ser maior ou igual a zero.')
  }
  const margin = input.desiredProfitMarginPercent ?? DEFAULT_DESIRED_PROFIT_MARGIN_PERCENT
  if (margin < 0) {
    throw new Error('A margem desejada deve ser maior ou igual a zero.')
  }
  if (margin >= MAX_DESIRED_PROFIT_MARGIN_PERCENT) {
    throw new Error('A margem desejada deve ser menor que 95%.')
  }
}

// ── Função principal ───────────────────────────────────────────────────

export function calculateRentabilidadeProcedimento(
  input: RentabilidadeProcedimentoInput,
): RentabilidadeProcedimentoCalculationResult {
  validateInput(input)

  // Normalização de defaults
  const fixedCostAllocation = input.fixedCostAllocation ?? DEFAULT_FIXED_COST_ALLOCATION
  const desiredProfitMarginPercent =
    input.desiredProfitMarginPercent ?? DEFAULT_DESIRED_PROFIT_MARGIN_PERCENT

  const { procedurePrice, procedureVariableCost, procedureDurationMinutes, hourlyClinicalCost } =
    input

  // ── Tempo clínico ───────────────────────────────────────────────────

  const procedureDurationHours = roundHours(procedureDurationMinutes / 60)
  const clinicalTimeCost = roundCurrency(procedureDurationHours * hourlyClinicalCost)

  // ── Custos ──────────────────────────────────────────────────────────

  const totalCost = roundCurrency(
    roundCurrency(procedureVariableCost) +
    clinicalTimeCost +
    roundCurrency(fixedCostAllocation),
  )

  // ── Lucros ──────────────────────────────────────────────────────────

  const grossProfit = roundCurrency(
    roundCurrency(procedurePrice) - roundCurrency(procedureVariableCost),
  )

  const netProfit = roundCurrency(roundCurrency(procedurePrice) - totalCost)

  // ── Indicadores percentuais ─────────────────────────────────────────

  const profitMarginPercent = roundPercent((netProfit / roundCurrency(procedurePrice)) * 100)

  const operationalRoiPercent =
    totalCost > 0 ? roundPercent((netProfit / totalCost) * 100) : 0

  const marginGapPercent = roundPercent(profitMarginPercent - desiredProfitMarginPercent)

  // ── Rentabilidade por hora ──────────────────────────────────────────

  const profitPerHour = roundCurrency(netProfit / procedureDurationHours)

  // ── Preços de referência ────────────────────────────────────────────

  const minimumSustainablePrice = roundCurrency(totalCost)

  const suggestedPrice = roundCurrency(
    totalCost / (1 - desiredProfitMarginPercent / 100),
  )

  const priceAdjustmentNeeded = roundCurrency(
    suggestedPrice - roundCurrency(procedurePrice),
  )

  return {
    procedurePrice: roundCurrency(procedurePrice),
    procedureVariableCost: roundCurrency(procedureVariableCost),
    procedureDurationMinutes,
    procedureDurationHours,
    hourlyClinicalCost: roundCurrency(hourlyClinicalCost),
    clinicalTimeCost,
    fixedCostAllocation: roundCurrency(fixedCostAllocation),
    totalCost,
    grossProfit,
    netProfit,
    profitMarginPercent,
    profitPerHour,
    operationalRoiPercent,
    desiredProfitMarginPercent: roundPercent(desiredProfitMarginPercent),
    minimumSustainablePrice,
    suggestedPrice,
    marginGapPercent,
    priceAdjustmentNeeded,
  }
}
