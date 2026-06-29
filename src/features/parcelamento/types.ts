// ── Motor financeiro ───────────────────────────────────────────────────

export interface ParcelamentoInput {
  treatmentValue: number
  installments: number
  cardFeePercent: number
  anticipationFeePercent: number
  desiredMarginPercent?: number
}

export interface ParcelamentoCalculationResult {
  treatmentValue: number
  installments: number
  installmentValue: number
  cardFeePercent: number
  anticipationFeePercent: number
  cardFeeAmount: number
  netValueFlow: number
  anticipationCost: number
  netValueAnticipated: number
  differenceBetweenFlowAndAnticipated: number
  effectiveFeePercent: number
  suggestedAdjustmentAmount: number
  suggestedTreatmentValue: number
  suggestedInstallmentValue: number
}

// ── Motor de diagnóstico ───────────────────────────────────────────────

export type ParcelamentoDiagnosticSeverity = 'success' | 'info' | 'warning' | 'danger'

export type ParcelamentoDiagnosticStatus = 'excellent' | 'healthy' | 'attention' | 'critical'

export interface ParcelamentoDiagnosticItem {
  id: string
  severity: ParcelamentoDiagnosticSeverity
  title: string
  message: string
}

export interface ParcelamentoDiagnosticResult {
  status: ParcelamentoDiagnosticStatus
  score: number
  summary: string
  positives: ParcelamentoDiagnosticItem[]
  warnings: ParcelamentoDiagnosticItem[]
}

// ── Motor de playbooks ─────────────────────────────────────────────────

export type ParcelamentoPlaybookPriority = 'low' | 'medium' | 'high' | 'critical'

export type ParcelamentoPlaybookCategory =
  | 'margin'
  | 'cashflow'
  | 'pricing'
  | 'fees'
  | 'installments'
  | 'sales'
  | 'risk'
  | 'opportunity'

/** Urgência de ação — usada pelo Motor de Orquestração para priorização dinâmica. */
export type ParcelamentoPlaybookUrgency = 'low' | 'medium' | 'high' | 'critical'

/** Esforço prático para executar a recomendação do playbook. */
export type ParcelamentoPlaybookImplementationEffort = 'low' | 'medium' | 'high'

/** Potencial de impacto financeiro caso a ação seja executada. */
export type ParcelamentoPlaybookFinancialImpactLevel = 'low' | 'medium' | 'high'

export interface ParcelamentoPlaybook {
  id: string
  title: string
  category: ParcelamentoPlaybookCategory
  priority: ParcelamentoPlaybookPriority
  /** Urgência de execução da recomendação. */
  urgency: ParcelamentoPlaybookUrgency
  /** Esforço prático estimado para implementar a ação sugerida. */
  implementationEffort: ParcelamentoPlaybookImplementationEffort
  /** Nível de impacto financeiro potencial caso a ação seja tomada. */
  financialImpactLevel: ParcelamentoPlaybookFinancialImpactLevel
  trigger: string
  objective: string
  whyItMatters: string
  recommendedAction: string
  expectedImpact: string
  checklist: string[]
}

export interface ParcelamentoPlaybookResult {
  playbooks: ParcelamentoPlaybook[]
}

// ── Motor de orquestração ──────────────────────────────────────────────

export interface ParcelamentoRecommendedAction {
  title: string
  message: string
  playbookId?: string
}

export interface ParcelamentoOrchestratorResult {
  calculation: ParcelamentoCalculationResult
  diagnostic: ParcelamentoDiagnosticResult
  /** Todos os playbooks aplicáveis, ordenados por score interno. */
  allPlaybooks: ParcelamentoPlaybook[]
  /** Subconjunto priorizado — no máximo 5, com diversidade de categoria. */
  prioritizedPlaybooks: ParcelamentoPlaybook[]
  /** Playbooks com priority ou urgency "critical". */
  criticalAlerts: ParcelamentoPlaybook[]
  /** Playbooks com category "opportunity". */
  opportunities: ParcelamentoPlaybook[]
  recommendedAction: ParcelamentoRecommendedAction
  executiveSummary: string
}

// ── Motor de narrativa ─────────────────────────────────────────────────

export type ParcelamentoNarrativeTone = 'positive' | 'neutral' | 'attention' | 'critical'

export interface ParcelamentoNarrativeSection {
  title: string
  body: string
  tone: ParcelamentoNarrativeTone
}

export interface ParcelamentoNarrative {
  headline: string
  summary: string
  scenarioReading: ParcelamentoNarrativeSection
  practicalAction: ParcelamentoNarrativeSection
  keyAlerts: ParcelamentoNarrativeSection[]
  opportunities: ParcelamentoNarrativeSection[]
  closingNote: string
}
