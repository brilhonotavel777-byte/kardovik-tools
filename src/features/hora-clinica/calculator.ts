import {
  MAX_HOURS_PER_DAY,
  MAX_OCCUPANCY_RATE_PERCENT,
  MAX_WORKING_DAYS_PER_MONTH,
  MIN_HOURS_PER_DAY,
  MIN_MONTHLY_COST,
  MIN_OCCUPANCY_RATE_PERCENT,
  MIN_WORKING_DAYS_PER_MONTH,
  PRECISION,
} from './constants'
import type { HoraClinicaCalculationResult, HoraClinicaInput } from './types'

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

function validateHoraClinicaInput(input: HoraClinicaInput): void {
  if (
    input.workingDaysPerMonth < MIN_WORKING_DAYS_PER_MONTH ||
    input.workingDaysPerMonth > MAX_WORKING_DAYS_PER_MONTH
  ) {
    throw new Error('Os dias trabalhados por mês devem ser entre 1 e 31.')
  }
  if (
    input.hoursPerDay < MIN_HOURS_PER_DAY ||
    input.hoursPerDay > MAX_HOURS_PER_DAY
  ) {
    throw new Error('As horas clínicas por dia devem ser entre 1 e 24.')
  }
  if (
    input.occupancyRatePercent < MIN_OCCUPANCY_RATE_PERCENT ||
    input.occupancyRatePercent > MAX_OCCUPANCY_RATE_PERCENT
  ) {
    throw new Error('A taxa de ocupação deve ser entre 1% e 100%.')
  }
  if (input.monthlyFixedCosts < MIN_MONTHLY_COST) {
    throw new Error('Os custos fixos mensais devem ser maiores ou iguais a zero.')
  }
  if (input.monthlyVariableCosts < MIN_MONTHLY_COST) {
    throw new Error('Os custos variáveis mensais devem ser maiores ou iguais a zero.')
  }
  if (input.desiredMonthlyProfit !== undefined && input.desiredMonthlyProfit < 0) {
    throw new Error('A meta de lucro mensal deve ser maior ou igual a zero.')
  }
}

// ── Função principal ───────────────────────────────────────────────────

export function calculateHoraClinica(
  input: HoraClinicaInput,
): HoraClinicaCalculationResult {
  validateHoraClinicaInput(input)

  const {
    workingDaysPerMonth,
    hoursPerDay,
    occupancyRatePercent,
    monthlyFixedCosts,
    monthlyVariableCosts,
  } = input

  const desiredMonthlyProfit = input.desiredMonthlyProfit ?? 0

  // ── Capacidade ──────────────────────────────────────────────────────

  const totalAvailableHours = roundHours(workingDaysPerMonth * hoursPerDay)

  const productiveHours = roundHours(
    totalAvailableHours * (occupancyRatePercent / 100),
  )

  if (productiveHours <= 0) {
    throw new Error('As horas produtivas devem ser maiores que zero.')
  }

  const idleHours = roundHours(totalAvailableHours - productiveHours)

  // ── Custos ─────────────────────────────────────────────────────────

  const totalMonthlyCost = roundCurrency(monthlyFixedCosts + monthlyVariableCosts)

  const clinicalHourCost = roundCurrency(totalMonthlyCost / productiveHours)

  const idleHoursCost = roundCurrency(idleHours * clinicalHourCost)

  // ── Receitas ────────────────────────────────────────────────────────

  const minimumHourlyRevenue = clinicalHourCost

  const recommendedHourlyRevenue = roundCurrency(
    (totalMonthlyCost + desiredMonthlyProfit) / productiveHours,
  )

  // Por construção, minimumMonthlyRevenue ≈ totalMonthlyCost (diferença máxima de 1 centavo por arredondamento)
  const minimumMonthlyRevenue = roundCurrency(minimumHourlyRevenue * productiveHours)

  const recommendedMonthlyRevenue = roundCurrency(
    recommendedHourlyRevenue * productiveHours,
  )

  // ── Gap ─────────────────────────────────────────────────────────────

  const revenueGapAmount = roundCurrency(recommendedHourlyRevenue - minimumHourlyRevenue)

  const revenueGapPercent =
    minimumHourlyRevenue > 0
      ? roundPercent((revenueGapAmount / minimumHourlyRevenue) * 100)
      : 0

  return {
    // Inputs espelhados
    workingDaysPerMonth,
    hoursPerDay,
    occupancyRatePercent,
    monthlyFixedCosts: roundCurrency(monthlyFixedCosts),
    monthlyVariableCosts: roundCurrency(monthlyVariableCosts),
    desiredMonthlyProfit: roundCurrency(desiredMonthlyProfit),

    // Capacidade
    totalAvailableHours,
    productiveHours,
    idleHours,

    // Custos
    totalMonthlyCost,
    clinicalHourCost,
    idleHoursCost,

    // Receitas
    minimumHourlyRevenue,
    recommendedHourlyRevenue,
    minimumMonthlyRevenue,
    recommendedMonthlyRevenue,

    // Gap
    revenueGapAmount,
    revenueGapPercent,
  }
}
