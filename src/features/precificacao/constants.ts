// ── Defaults de formulário ─────────────────────────────────────────────

export const DEFAULT_CARD_FEE_PERCENT = 3.5
export const DEFAULT_TAX_PERCENT = 6
export const DEFAULT_MARGIN_PERCENT = 30
export const DEFAULT_LAB_COST = 0

// ── Limites de validação ───────────────────────────────────────────────

export const MIN_MATERIAL_COST = 0
export const MIN_LAB_COST = 0
export const MIN_CLINICAL_TIME_MINUTES = 1
export const MIN_HOURLY_CLINICAL_COST = 0.01

export const MIN_PERCENT = 0
export const MAX_MARGIN_PERCENT = 95

// Limiar de segurança para evitar divisão por zero ou resultado negativo
// nas fórmulas de minimumPrice e suggestedPrice.
export const MAX_TOTAL_PERCENT_BEFORE_DIVISION = 99.99

// ── Precisão de arredondamento ─────────────────────────────────────────

export const PRECISION = 2
