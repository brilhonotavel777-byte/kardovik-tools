import {
  DEFAULT_DESIRED_MONTHLY_PROFIT,
  DEFAULT_WORKING_DAYS_PER_MONTH,
  MAX_VARIABLE_COST_PERCENT,
  MAX_WORKING_DAYS_PER_MONTH,
  MIN_AVERAGE_TICKET,
  MIN_CURRENT_MONTHLY_REVENUE,
  MIN_MONTHLY_FIXED_COSTS,
  MIN_VARIABLE_COST_PERCENT,
  MIN_WORKING_DAYS_PER_MONTH,
  PRECISION,
} from './constants'
import type {
  PontoEquilibrioCalculationResult,
  PontoEquilibrioInput,
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

function roundCount(value: number): number {
  return roundToPrecision(value)
}

// ── Validação ──────────────────────────────────────────────────────────

function validatePontoEquilibrioInput(input: PontoEquilibrioInput): void {
  if (input.monthlyFixedCosts < MIN_MONTHLY_FIXED_COSTS) {
    throw new Error('Os custos fixos mensais devem ser maiores ou iguais a zero.')
  }
  if (input.averageVariableCostPercent < MIN_VARIABLE_COST_PERCENT) {
    throw new Error('O percentual de custo variável deve ser maior ou igual a zero.')
  }
  if (input.averageVariableCostPercent >= MAX_VARIABLE_COST_PERCENT) {
    throw new Error('O percentual de custo variável deve ser menor que 95%.')
  }
  if (input.averageTicket < MIN_AVERAGE_TICKET) {
    throw new Error('O ticket médio deve ser maior que zero.')
  }
  if (
    input.currentMonthlyRevenue !== undefined &&
    input.currentMonthlyRevenue < MIN_CURRENT_MONTHLY_REVENUE
  ) {
    throw new Error('O faturamento mensal atual deve ser maior que zero quando informado.')
  }
  if (
    input.desiredMonthlyProfit !== undefined &&
    input.desiredMonthlyProfit < 0
  ) {
    throw new Error('A meta de lucro mensal deve ser maior ou igual a zero.')
  }
  const workingDays = input.workingDaysPerMonth ?? DEFAULT_WORKING_DAYS_PER_MONTH
  if (workingDays < MIN_WORKING_DAYS_PER_MONTH || workingDays > MAX_WORKING_DAYS_PER_MONTH) {
    throw new Error('Os dias úteis por mês devem ser entre 1 e 31.')
  }
}

// ── Função principal ───────────────────────────────────────────────────

export function calculatePontoEquilibrio(
  input: PontoEquilibrioInput,
): PontoEquilibrioCalculationResult {
  validatePontoEquilibrioInput(input)

  // Normalização de defaults
  const desiredMonthlyProfit = input.desiredMonthlyProfit ?? DEFAULT_DESIRED_MONTHLY_PROFIT
  const workingDaysPerMonth = input.workingDaysPerMonth ?? DEFAULT_WORKING_DAYS_PER_MONTH
  const { monthlyFixedCosts, averageVariableCostPercent, averageTicket } = input

  // ── Margem de contribuição ──────────────────────────────────────────

  const contributionMarginPercent = roundPercent(100 - averageVariableCostPercent)
  const contributionMarginRate = roundPercent(contributionMarginPercent / 100)

  // ── Ponto de equilíbrio ─────────────────────────────────────────────

  const breakEvenRevenue = roundCurrency(
    roundCurrency(monthlyFixedCosts) / contributionMarginRate,
  )
  const breakEvenProcedures = roundCount(breakEvenRevenue / roundCurrency(averageTicket))

  // ── Receita alvo (com lucro) ────────────────────────────────────────

  const targetRevenue = roundCurrency(
    (roundCurrency(monthlyFixedCosts) + roundCurrency(desiredMonthlyProfit)) /
      contributionMarginRate,
  )
  const targetProcedures = roundCount(targetRevenue / roundCurrency(averageTicket))

  // ── Metas diárias ───────────────────────────────────────────────────

  const dailyBreakEvenRevenue = roundCurrency(breakEvenRevenue / workingDaysPerMonth)
  const dailyTargetRevenue = roundCurrency(targetRevenue / workingDaysPerMonth)

  // ── Base do resultado ───────────────────────────────────────────────

  const base: PontoEquilibrioCalculationResult = {
    monthlyFixedCosts: roundCurrency(monthlyFixedCosts),
    averageVariableCostPercent: roundPercent(averageVariableCostPercent),
    averageTicket: roundCurrency(averageTicket),
    desiredMonthlyProfit: roundCurrency(desiredMonthlyProfit),
    workingDaysPerMonth,
    contributionMarginPercent,
    contributionMarginRate,
    breakEvenRevenue,
    breakEvenProcedures,
    targetRevenue,
    targetProcedures,
    dailyBreakEvenRevenue,
    dailyTargetRevenue,
  }

  // ── Campos condicionais (somente quando currentMonthlyRevenue informado) ──

  if (input.currentMonthlyRevenue === undefined) {
    return base
  }

  const currentMonthlyRevenue = roundCurrency(input.currentMonthlyRevenue)

  const revenueGapAmount = roundCurrency(currentMonthlyRevenue - breakEvenRevenue)

  const revenueGapPercent = roundPercent(
    (revenueGapAmount / breakEvenRevenue) * 100,
  )

  const safetyMarginPercent = roundPercent(
    (revenueGapAmount / currentMonthlyRevenue) * 100,
  )

  return {
    ...base,
    currentMonthlyRevenue,
    revenueGapAmount,
    revenueGapPercent,
    safetyMarginPercent,
  }
}
