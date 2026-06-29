// ── Motor financeiro — Calculadora de Rentabilidade por Procedimento ──

export interface RentabilidadeProcedimentoInput {
  procedurePrice: number
  procedureVariableCost: number
  procedureDurationMinutes: number
  hourlyClinicalCost: number
  fixedCostAllocation?: number
  desiredProfitMarginPercent?: number
}

export interface RentabilidadeProcedimentoCalculationResult {
  // Inputs espelhados
  procedurePrice: number
  procedureVariableCost: number
  procedureDurationMinutes: number
  hourlyClinicalCost: number
  fixedCostAllocation: number
  desiredProfitMarginPercent: number

  // Tempo clínico
  procedureDurationHours: number
  clinicalTimeCost: number

  // Custos e lucros
  totalCost: number
  grossProfit: number
  netProfit: number

  // Indicadores percentuais
  profitMarginPercent: number
  operationalRoiPercent: number
  marginGapPercent: number

  // Rentabilidade
  profitPerHour: number

  // Preços de referência
  minimumSustainablePrice: number
  suggestedPrice: number
  priceAdjustmentNeeded: number
}

// ── Motor de diagnóstico ───────────────────────────────────────────────

export type RentabilidadeProcedimentoDiagnosticSeverity =
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'

export type RentabilidadeProcedimentoDiagnosticStatus =
  | 'excellent'
  | 'healthy'
  | 'attention'
  | 'critical'

export interface RentabilidadeProcedimentoDiagnosticItem {
  id: string
  severity: RentabilidadeProcedimentoDiagnosticSeverity
  title: string
  message: string
}

export interface RentabilidadeProcedimentoDiagnosticResult {
  status: RentabilidadeProcedimentoDiagnosticStatus
  score: number
  summary: string
  positives: RentabilidadeProcedimentoDiagnosticItem[]
  warnings: RentabilidadeProcedimentoDiagnosticItem[]
}

// ── Motor de playbooks ─────────────────────────────────────────────────

export type RentabilidadeProcedimentoPlaybookPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export type RentabilidadeProcedimentoPlaybookCategory =
  | 'margin'
  | 'pricing'
  | 'costs'
  | 'time'
  | 'profit'
  | 'roi'
  | 'risk'
  | 'opportunity'
  | 'standardization'
  | 'strategy'

export type RentabilidadeProcedimentoPlaybookUrgency =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export type RentabilidadeProcedimentoPlaybookImplementationEffort =
  | 'low'
  | 'medium'
  | 'high'

export type RentabilidadeProcedimentoPlaybookFinancialImpactLevel =
  | 'low'
  | 'medium'
  | 'high'

export interface RentabilidadeProcedimentoPlaybook {
  id: string
  title: string
  subtitle?: string
  category: RentabilidadeProcedimentoPlaybookCategory
  priority: RentabilidadeProcedimentoPlaybookPriority
  urgency: RentabilidadeProcedimentoPlaybookUrgency
  implementationEffort: RentabilidadeProcedimentoPlaybookImplementationEffort
  financialImpactLevel: RentabilidadeProcedimentoPlaybookFinancialImpactLevel
  trigger: string
  objective: string
  whyItMatters: string
  recommendedAction: string
  expectedImpact: string
  checklist: string[]
}

export interface RentabilidadeProcedimentoPlaybookResult {
  playbooks: RentabilidadeProcedimentoPlaybook[]
}

// ── Motor de orquestração ──────────────────────────────────────────────

export interface RentabilidadeProcedimentoRecommendedAction {
  title: string
  message: string
  playbookId?: string
}

export interface RentabilidadeProcedimentoOrchestratorResult {
  calculation: RentabilidadeProcedimentoCalculationResult
  diagnostic: RentabilidadeProcedimentoDiagnosticResult
  /** Todos os playbooks aplicáveis, ordenados por score interno. */
  allPlaybooks: RentabilidadeProcedimentoPlaybook[]
  /** Subconjunto priorizado — no máximo 5, com diversidade de categoria. */
  prioritizedPlaybooks: RentabilidadeProcedimentoPlaybook[]
  /** Playbooks com priority ou urgency "critical". */
  criticalAlerts: RentabilidadeProcedimentoPlaybook[]
  /** Playbooks com category "opportunity" ou "standardization". */
  opportunities: RentabilidadeProcedimentoPlaybook[]
  recommendedAction: RentabilidadeProcedimentoRecommendedAction
  executiveSummary: string
}

// ── Motor de narrativa ─────────────────────────────────────────────────

export interface RentabilidadeProcedimentoNarrative {
  headline: string
  summary: string
  scenarioReading: string
  practicalAction: string
  keyAlerts: string[]
  opportunities: string[]
  closingNote: string
}
