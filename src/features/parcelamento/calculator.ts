import { MIN_INSTALLMENTS, MAX_INSTALLMENTS } from './constants'
import type { ParcelamentoInput, ParcelamentoCalculationResult } from './types'

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100
}

function validateParcelamentoInput(input: ParcelamentoInput): void {
  if (input.treatmentValue <= 0) {
    throw new Error('O valor do tratamento deve ser maior que zero.')
  }
  if (
    !Number.isInteger(input.installments) ||
    input.installments < MIN_INSTALLMENTS ||
    input.installments > MAX_INSTALLMENTS
  ) {
    throw new Error(
      `O número de parcelas deve ser um inteiro entre ${MIN_INSTALLMENTS} e ${MAX_INSTALLMENTS}.`,
    )
  }
  if (input.cardFeePercent < 0) {
    throw new Error('A taxa da maquininha deve ser maior ou igual a zero.')
  }
  if (input.anticipationFeePercent < 0) {
    throw new Error('A taxa de antecipação deve ser maior ou igual a zero.')
  }
  if (
    input.desiredMarginPercent !== undefined &&
    input.desiredMarginPercent < 0
  ) {
    throw new Error('A margem desejada deve ser maior ou igual a zero.')
  }
}

export function calculateParcelamento(
  input: ParcelamentoInput,
): ParcelamentoCalculationResult {
  validateParcelamentoInput(input)

  const { treatmentValue, installments, cardFeePercent, anticipationFeePercent } =
    input

  const installmentValue = roundCurrency(treatmentValue / installments)

  const cardFeeAmount = roundCurrency(treatmentValue * (cardFeePercent / 100))

  const netValueFlow = roundCurrency(treatmentValue - cardFeeAmount)

  // Linear approximation: each of the `installments` months carries the
  // anticipation fee over the full outstanding balance (simplified model).
  // For installments === 1 there are no future receivables to anticipate,
  // so the anticipation cost is zero regardless of the fee rate.
  const anticipationCost =
    installments > 1
      ? roundCurrency(treatmentValue * (anticipationFeePercent / 100) * installments)
      : 0

  const netValueAnticipated = roundCurrency(
    treatmentValue - cardFeeAmount - anticipationCost,
  )

  const differenceBetweenFlowAndAnticipated = roundCurrency(
    netValueFlow - netValueAnticipated,
  )

  const effectiveFeePercent = roundPercent(
    ((cardFeeAmount + anticipationCost) / treatmentValue) * 100,
  )

  const suggestedAdjustmentAmount = roundCurrency(cardFeeAmount + anticipationCost)

  const suggestedTreatmentValue = roundCurrency(
    treatmentValue + suggestedAdjustmentAmount,
  )

  const suggestedInstallmentValue = roundCurrency(
    suggestedTreatmentValue / installments,
  )

  return {
    treatmentValue,
    installments,
    installmentValue,
    cardFeePercent,
    anticipationFeePercent,
    cardFeeAmount,
    netValueFlow,
    anticipationCost,
    netValueAnticipated,
    differenceBetweenFlowAndAnticipated,
    effectiveFeePercent,
    suggestedAdjustmentAmount,
    suggestedTreatmentValue,
    suggestedInstallmentValue,
  }
}
